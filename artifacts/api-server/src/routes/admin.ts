import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, projectsTable, usersTable } from "@workspace/db";
import {
  ListAdminProjectsQueryParams,
  ListAdminProjectsResponse,
  ApproveProjectParams,
  ApproveProjectResponse,
  RejectProjectParams,
  RejectProjectBody,
  RejectProjectResponse,
  DeleteAdminProjectParams,
} from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/requireAuth";
import { mapProject } from "./projects";

const router: IRouter = Router();

router.get("/admin/projects", requireAdmin, async (req, res): Promise<void> => {
  const params = ListAdminProjectsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const query = db.select().from(projectsTable);
  const projects = params.data.status
    ? await query.where(eq(projectsTable.status, params.data.status as typeof projectsTable.$inferSelect["status"]))
    : await query;

  const allUsers = await db.select().from(usersTable);
  const userMap = new Map(allUsers.map((u) => [u.id, u]));

  const result = projects.map((p) => {
    const u = userMap.get(p.studentId);
    return {
      id: p.id,
      studentName: u?.fullName ?? "",
      studentEmail: u?.email ?? "",
      title: p.title,
      slug: p.slug,
      category: p.category,
      city: p.city,
      stage: p.stage,
      status: p.status,
      coverUrl: p.coverUrl ?? null,
      techStack: p.techStack,
      aiUsage: {
        isUsed: p.aiIsUsed,
        tools: p.aiTools,
        usageAreas: p.aiUsageAreas,
        verificationMethod: p.aiVerificationMethod,
      },
      adminFeedback: p.adminFeedback ?? null,
      createdAt: p.createdAt.toISOString(),
    };
  });

  res.json(ListAdminProjectsResponse.parse(result));
});

router.patch("/admin/projects/:id/approve", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramsParsed = ApproveProjectParams.safeParse({ id: parseInt(rawId ?? "0", 10) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, paramsParsed.data.id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Proje bulunamadı." });
    return;
  }

  const [updated] = await db
    .update(projectsTable)
    .set({ status: "approved", adminFeedback: null })
    .where(eq(projectsTable.id, paramsParsed.data.id))
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, existing.studentId)).limit(1);

  res.json(ApproveProjectResponse.parse(mapProject(updated!, user)));
});

router.patch("/admin/projects/:id/reject", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramsParsed = RejectProjectParams.safeParse({ id: parseInt(rawId ?? "0", 10) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }

  const bodyParsed = RejectProjectBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, paramsParsed.data.id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Proje bulunamadı." });
    return;
  }

  const [updated] = await db
    .update(projectsTable)
    .set({ status: "rejected", adminFeedback: bodyParsed.data.feedback })
    .where(eq(projectsTable.id, paramsParsed.data.id))
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, existing.studentId)).limit(1);

  res.json(RejectProjectResponse.parse(mapProject(updated!, user)));
});

router.delete("/admin/projects/:id", requireAdmin, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramsParsed = DeleteAdminProjectParams.safeParse({ id: parseInt(rawId ?? "0", 10) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, paramsParsed.data.id))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Proje bulunamadı." });
    return;
  }

  await db.delete(projectsTable).where(eq(projectsTable.id, paramsParsed.data.id));

  res.sendStatus(204);
});

export default router;
