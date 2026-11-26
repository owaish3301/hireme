import type { DB } from "../../prisma/db.js";

export const makeHealthRepository = (db: DB) => {
  return {
    healthCheck: async () => {
      try {
        const plan = db.raw.sql`SELECT 1 AS ok`
          .returnsRow({ ok: "pg/int4@1" })
          .build();
        await db.query(plan);
        return { ok: true } as const;
      } catch (e) {
        return { ok: false, error: e } as const;
      }
    },
  };
};

export type HealthRepository = ReturnType<typeof makeHealthRepository>;
