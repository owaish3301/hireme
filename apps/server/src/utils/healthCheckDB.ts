import { db } from "../prisma/db.js";

async function healthCheckDB() {
  try {
    const plan = db.raw.sql`SELECT 1 AS ok`
      .returnsRow({ ok: "pg/int4@1" })
      .build();
    await db.query(plan);
    return { ok : true} as const
  } catch (e) {
    return {ok : false, error:e} as const
  }
}

export {healthCheckDB}