import { Router, type IRouter } from "express";
import { eq, and } from "drizzle-orm";
import { db, projectsTable, usersTable } from "@workspace/db";
import {
  ListMyProjectsResponse,
  CreateProjectBody,
  CreateProjectResponse,
  UpdateProjectParams,
  UpdateProjectBody,
  UpdateProjectResponse,
  DeleteProjectParams,
} from "@workspace/api-zod";
import { requireAuth } from "../middlewares/requireAuth";
import { mapProject } from "./projects";

const router: IRouter = Router();

function generateSlug(title: string, id: number): string {
  const base = title
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `${base}-${id}`;
}

function projectInputToDb(data: ReturnType<typeof CreateProjectBody.parse>, studentId: number, slug: string) {
  return {
    studentId,
    title: data.title,
    slug,
    category: data.category as typeof projectsTable.$inferSelect["category"],
    city: data.city as "Konya" | "Afyonkarahisar",
    stage: data.stage as "MVP" | "Prototip",
    problem: data.problem,
    targetAudience: data.targetAudience,
    solution: data.solution,
    futurePlans: data.futurePlans,
    techStack: data.techStack,
    githubUrl: data.githubUrl ?? null,
    demoUrl: data.demoUrl ?? null,
    coverUrl: data.coverUrl ?? null,
    screenshotUrls: data.screenshotUrls ?? [],
    aiIsUsed: data.aiUsage.isUsed,
    aiTools: data.aiUsage.tools,
    aiUsageAreas: data.aiUsage.usageAreas,
    aiVerificationMethod: data.aiUsage.verificationMethod,
    securityNoRealPersonalData: data.securityAndEthics.noRealPersonalData,
    securityNoSecretsInGithub: data.securityAndEthics.noSecretsInGithub,
    securityCopyrightCompliant: data.securityAndEthics.copyrightCompliant,
    // Admin onayı geçici olarak devre dışı: gönderilen projeler doğrudan yayınlanır.
    status: (data.status === "pending" ? "approved" : (data.status ?? "draft")) as
      | "draft"
      | "approved",
  };
}

router.get("/student/projects", requireAuth, async (req, res): Promise<void> => {
  const projects = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.studentId, req.session.userId!))
    .orderBy(projectsTable.createdAt);

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);

  const result = projects.map((p) => mapProject(p, user));
  res.json(ListMyProjectsResponse.parse(result));
});

router.post("/student/projects", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateProjectBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  // Insert with temporary slug, then update with id
  const [project] = await db
    .insert(projectsTable)
    .values(projectInputToDb(parsed.data, req.session.userId!, "temp-slug"))
    .returning();

  if (!project) {
    res.status(500).json({ error: "Proje oluşturulamadı." });
    return;
  }

  const slug = generateSlug(parsed.data.title, project.id);
  const [updated] = await db
    .update(projectsTable)
    .set({ slug })
    .where(eq(projectsTable.id, project.id))
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);

  res.status(201).json(CreateProjectResponse.parse(mapProject(updated!, user)));
});

router.patch("/student/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramsParsed = UpdateProjectParams.safeParse({ id: parseInt(rawId ?? "0", 10) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, paramsParsed.data.id), eq(projectsTable.studentId, req.session.userId!)))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Proje bulunamadı." });
    return;
  }

  // Admin onayı geçici olarak devre dışı: onaylı projeler de düzenlenebilir.
  // Admin onayı yeniden aktif edilirse, bu düzenleme izni gözden geçirilmelidir.
  const bodyParsed = UpdateProjectBody.safeParse(req.body);
  if (!bodyParsed.success) {
    res.status(400).json({ error: bodyParsed.error.message });
    return;
  }

  const d = bodyParsed.data;
  const updateData: Partial<typeof projectsTable.$inferInsert> = {};

  if (d.title !== undefined) {
    updateData.title = d.title;
    updateData.slug = generateSlug(d.title, existing.id);
  }
  if (d.category !== undefined) updateData.category = d.category as typeof projectsTable.$inferSelect["category"];
  if (d.city !== undefined) updateData.city = d.city as "Konya" | "Afyonkarahisar";
  if (d.stage !== undefined) updateData.stage = d.stage as "MVP" | "Prototip";
  if (d.problem !== undefined) updateData.problem = d.problem;
  if (d.targetAudience !== undefined) updateData.targetAudience = d.targetAudience;
  if (d.solution !== undefined) updateData.solution = d.solution;
  if (d.futurePlans !== undefined) updateData.futurePlans = d.futurePlans;
  if (d.techStack !== undefined) updateData.techStack = d.techStack;
  if (d.githubUrl !== undefined) updateData.githubUrl = d.githubUrl;
  if (d.demoUrl !== undefined) updateData.demoUrl = d.demoUrl;
  if (d.coverUrl !== undefined) updateData.coverUrl = d.coverUrl;
  if (d.screenshotUrls !== undefined) updateData.screenshotUrls = d.screenshotUrls;
  if (d.aiUsage !== undefined) {
    updateData.aiIsUsed = d.aiUsage.isUsed;
    updateData.aiTools = d.aiUsage.tools;
    updateData.aiUsageAreas = d.aiUsage.usageAreas;
    updateData.aiVerificationMethod = d.aiUsage.verificationMethod;
  }
  if (d.securityAndEthics !== undefined) {
    updateData.securityNoRealPersonalData = d.securityAndEthics.noRealPersonalData;
    updateData.securityNoSecretsInGithub = d.securityAndEthics.noSecretsInGithub;
    updateData.securityCopyrightCompliant = d.securityAndEthics.copyrightCompliant;
  }
  if (d.status !== undefined) {
    // Admin onayı geçici olarak devre dışı: gönderilen projeler doğrudan yayınlanır.
    updateData.status = (d.status === "pending" ? "approved" : d.status) as "draft" | "approved";
    if (d.status === "pending") updateData.adminFeedback = null;
  }

  const [updated] = await db
    .update(projectsTable)
    .set(updateData)
    .where(eq(projectsTable.id, paramsParsed.data.id))
    .returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId!)).limit(1);

  res.json(UpdateProjectResponse.parse(mapProject(updated!, user)));
});

router.delete("/student/projects/:id", requireAuth, async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const paramsParsed = DeleteProjectParams.safeParse({ id: parseInt(rawId ?? "0", 10) });
  if (!paramsParsed.success) {
    res.status(400).json({ error: paramsParsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, paramsParsed.data.id), eq(projectsTable.studentId, req.session.userId!)))
    .limit(1);

  if (!existing) {
    res.status(404).json({ error: "Proje bulunamadı." });
    return;
  }

  await db.delete(projectsTable).where(eq(projectsTable.id, paramsParsed.data.id));

  res.sendStatus(204);
});

export default router;
