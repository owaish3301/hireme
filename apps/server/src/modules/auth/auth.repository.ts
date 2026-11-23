import { TokenPayload } from "google-auth-library";
import { db } from "../../prisma/db.js";
import { AuthError } from "../../error/auth.error.js";
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
    "createdAt",
    "updatedAt",
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
