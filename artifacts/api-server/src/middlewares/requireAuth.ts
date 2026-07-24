import { type Request, type Response, type NextFunction } from "express";

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    res.status(401).json({ error: "Kimlik doğrulama gerekli." });
    return;
  }
  next();
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.session.userId) {
    res.status(401).json({ error: "Kimlik doğrulama gerekli." });
    return;
  }
  if (req.session.role !== "admin") {
    res.status(403).json({ error: "Bu işlem için yönetici yetkisi gerekli." });
    return;
  }
  next();
}
