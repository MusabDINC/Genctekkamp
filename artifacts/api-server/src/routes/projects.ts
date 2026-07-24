import { Router, type IRouter } from "express";
import { eq, and, ilike, type SQL } from "drizzle-orm";
import { db, projectsTable, usersTable } from "@workspace/db";
import {
  ListProjectsQueryParams,
  ListProjectsResponse,
  GetProjectParams,
  GetProjectResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function mapProject(p: typeof projectsTable.$inferSelect, user: typeof usersTable.$inferSelect | undefined) {
  return {
    id: p.id,
    studentId: p.studentId,
    studentName: user?.fullName ?? "",
    title: p.title,
    slug: p.slug,
    category: p.category,
    city: p.city,
    stage: p.stage,
    problem: p.problem,
    targetAudience: p.targetAudience,
    solution: p.solution,
    futurePlans: p.futurePlans,
    techStack: p.techStack,
    githubUrl: p.githubUrl ?? null,
    demoUrl: p.demoUrl ?? null,
    coverUrl: p.coverUrl ?? null,
    screenshotUrls: p.screenshotUrls,
    aiUsage: {
      isUsed: p.aiIsUsed,
      tools: p.aiTools,
      usageAreas: p.aiUsageAreas,
      verificationMethod: p.aiVerificationMethod,
    },
    securityAndEthics: {
      noRealPersonalData: p.securityNoRealPersonalData,
      noSecretsInGithub: p.securityNoSecretsInGithub,
      copyrightCompliant: p.securityCopyrightCompliant,
    },
    status: p.status,
    adminFeedback: p.adminFeedback ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  };
}

export { mapProject };

router.get("/projects", async (req, res): Promise<void> => {
  const params = ListProjectsQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions: SQL[] = [eq(projectsTable.status, "approved")];

  if (params.data.city) {
    conditions.push(eq(projectsTable.city, params.data.city as "Konya" | "Afyonkarahisar"));
  }
  if (params.data.category) {
    conditions.push(eq(projectsTable.category, params.data.category as typeof projectsTable.$inferSelect["category"]));
  }
  if (params.data.stage) {
    conditions.push(eq(projectsTable.stage, params.data.stage as "MVP" | "Prototip"));
  }
  if (params.data.search) {
    conditions.push(ilike(projectsTable.title, `%${params.data.search}%`));
  }

  const projects = await db
    .select()
    .from(projectsTable)
    .where(and(...conditions))
    .orderBy(projectsTable.createdAt);

  const userIds = [...new Set(projects.map((p) => p.studentId))];
  const users = userIds.length > 0
    ? await db.select().from(usersTable).where(
        userIds.length === 1
          ? eq(usersTable.id, userIds[0]!)
          : eq(usersTable.id, userIds[0]!), // will be replaced below
      )
    : [];

  // Fetch all relevant users
  const userMap = new Map<number, typeof usersTable.$inferSelect>();
  if (userIds.length > 0) {
    const allUsers = await db.select().from(usersTable);
    for (const u of allUsers) {
      userMap.set(u.id, u);
    }
  }

  const result = projects.map((p) => {
    const u = userMap.get(p.studentId);
    return {
      id: p.id,
      studentName: u?.fullName ?? "",
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
      createdAt: p.createdAt.toISOString(),
    };
  });

  res.json(ListProjectsResponse.parse(result));
});

router.get("/projects/:id", async (req, res): Promise<void> => {
  const raw = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const parsed = GetProjectParams.safeParse({ id: parseInt(raw ?? "0", 10) });
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [project] = await db
    .select()
    .from(projectsTable)
    .where(and(eq(projectsTable.id, parsed.data.id), eq(projectsTable.status, "approved")))
    .limit(1);

  if (!project) {
    res.status(404).json({ error: "Proje bulunamadı." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, project.studentId)).limit(1);

  res.json(GetProjectResponse.parse(mapProject(project, user)));
});

export default router;
