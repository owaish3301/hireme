import { TokenPayload } from "google-auth-library";
import { db } from "../../prisma/db.js";
import { AuthError, UnauthenticatedError } from "../../error/auth.error.js";
import { randomUUID } from "node:crypto";
import { REFRESH_TOKEN_TTL_MS } from "./auth.constant.js";

export const createNewUser = async (userInfo: TokenPayload) => {
  const { sub, email, name, picture } = userInfo;
  if (!email || !name) {
    throw new AuthError("google account missing email or name", {
      statusCode: 500,
    });
  }
  const user = await db.orm.public.User.select(
    "id",
    "name",
    "email",
    "avatarUrl",
    "isOnboarded",
  ).upsert({
    create: { googleSub: sub, email, name, avatarUrl: picture },
    update: { name, email, avatarUrl: picture },
    conflictOn: { googleSub: sub },
  });

  return user;
};

export const createNewSession = async ({
  userId,
  refreshTokenHash,
}: {
  userId: string;
  refreshTokenHash: string;
}) => {
  await db.orm.public.Session.create({
    userId,
    refreshTokenHash,
    familyId: randomUUID(),
    expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
  });
};

export const rotateSession = async (
  refreshTokenHash: string,
  newRefreshTokenHash: string,
) => {
  const oldSession = await db.orm.public.Session.whereUnique({
    refreshTokenHash,
  }).first();
  if (!oldSession) {
    throw new UnauthenticatedError();
  }

  if (oldSession.revokedAt || oldSession.replacedById) {
    // revoke the session family
    await revokeSessionFamily(oldSession.familyId);
    throw new UnauthenticatedError();
  }

  if (oldSession.expiresAt < new Date()) {
    throw new UnauthenticatedError();
  }

  await db.transaction(async (tx) => {
    const newSession = await tx.orm.public.Session.create({
      userId: oldSession.userId,
      refreshTokenHash: newRefreshTokenHash,
      familyId: oldSession.familyId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    });

    const updated = await tx.orm.public.Session
    .where({ id: oldSession.id })
    .where((s)=>s.revokedAt.isNull())
    .update({
      replacedById: newSession.id,
      revokedAt: new Date(),
    });
    if(!updated){
      // guard against race condition so 2 refresh at once only 1 can revoke the old session 
      throw new UnauthenticatedError();
    }
  });
  
  return oldSession.userId;
};

export const revokeSessionFamily = async (familyId: string) => {
  return db.orm.public.Session.where({ familyId })
    .where((s) => s.revokedAt.isNull())
    .updateAndCount({ revokedAt: new Date() });
};
