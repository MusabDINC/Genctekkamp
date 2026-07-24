import { Router, type IRouter } from "express";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db, usersTable } from "@workspace/db";
import {
  RegisterBody,
  LoginBody,
  RegisterResponse,
  LoginResponse,
  GetMeResponse,
  LogoutResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/ğ/g, "g").replace(/ü/g, "u").replace(/ş/g, "s")
    .replace(/ı/g, "i").replace(/ö/g, "o").replace(/ç/g, "c")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export { slugify };

router.post("/auth/register", async (req, res): Promise<void> => {
  const parsed = RegisterBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password, fullName, school, city } = parsed.data;

  const existing = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (existing.length > 0) {
    res.status(409).json({ error: "Bu e-posta adresi zaten kullanımda." });
    return;
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const [user] = await db
    .insert(usersTable)
    .values({ email, passwordHash, fullName, school, city: city as "Konya" | "Afyonkarahisar", role: "student" })
    .returning();

  req.session.userId = user.id;
  req.session.role = user.role as "student" | "admin";

  res.status(201).json(
    RegisterResponse.parse({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      school: user.school,
      city: user.city,
      role: user.role,
    }),
  );
});

router.post("/auth/login", async (req, res): Promise<void> => {
  const parsed = LoginBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { email, password } = parsed.data;

  const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email)).limit(1);
  if (!user) {
    res.status(401).json({ error: "E-posta veya şifre hatalı." });
    return;
  }

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    res.status(401).json({ error: "E-posta veya şifre hatalı." });
    return;
  }

  req.session.userId = user.id;
  req.session.role = user.role as "student" | "admin";

  res.json(
    LoginResponse.parse({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      school: user.school,
      city: user.city,
      role: user.role,
    }),
  );
});

router.post("/auth/logout", async (req, res): Promise<void> => {
  req.session.destroy(() => {
    res.json(LogoutResponse.parse({ success: true }));
  });
});

router.get("/auth/me", async (req, res): Promise<void> => {
  if (!req.session.userId) {
    res.status(401).json({ error: "Oturum açık değil." });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.session.userId)).limit(1);
  if (!user) {
    req.session.destroy(() => {});
    res.status(401).json({ error: "Kullanıcı bulunamadı." });
    return;
  }

  res.json(
    GetMeResponse.parse({
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      school: user.school,
      city: user.city,
      role: user.role,
    }),
  );
});

export default router;
