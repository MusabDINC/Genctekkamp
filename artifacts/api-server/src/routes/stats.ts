import { Router, type IRouter } from "express";
import { eq, and, count } from "drizzle-orm";
import { db, projectsTable } from "@workspace/db";
import { GetStatsResponse } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats", async (_req, res): Promise<void> => {
  const [totalRow] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(eq(projectsTable.status, "approved"));

  const [konyaRow] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(and(eq(projectsTable.status, "approved"), eq(projectsTable.city, "Konya")));

  const [afyonRow] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(and(eq(projectsTable.status, "approved"), eq(projectsTable.city, "Afyonkarahisar")));

  const [aiRow] = await db
    .select({ count: count() })
    .from(projectsTable)
    .where(and(eq(projectsTable.status, "approved"), eq(projectsTable.aiIsUsed, true)));

  res.json(
    GetStatsResponse.parse({
      total: Number(totalRow?.count ?? 0),
      konya: Number(konyaRow?.count ?? 0),
      afyonkarahisar: Number(afyonRow?.count ?? 0),
      aiSupported: Number(aiRow?.count ?? 0),
    }),
  );
});

export default router;
