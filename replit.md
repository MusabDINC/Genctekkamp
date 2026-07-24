# Fikirden Ürüne Proje Vitrini

GençTek ekosistemi öğrencilerinin (Konya & Afyonkarahisar) yapay zeka destekli projelerini sergilediği, onay akışlı bir proje vitrin platformu.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — API sunucusu (port 8080)
- `pnpm --filter @workspace/proje-vitrini run dev` — Frontend (port 25422)
- `pnpm run typecheck` — tüm paketlerde tip kontrolü
- `pnpm run build` — typecheck + build
- `pnpm --filter @workspace/api-spec run codegen` — OpenAPI'dan hook ve Zod şemaları üret
- `pnpm --filter @workspace/db run push` — DB şemasını uygula (sadece dev)
- Required env: `DATABASE_URL`, `SESSION_SECRET`

## Demo Hesaplar

- **Admin:** admin@genctek.com / admin123
- **Öğrenci:** ahmet@genctek.com / admin123
- **Öğrenci:** zeynep@genctek.com / admin123

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React 18 + Vite + Tailwind CSS + shadcn/ui + wouter
- API: Express 5 + express-session + bcryptjs
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (zod/v4), drizzle-zod
- API codegen: Orval (OpenAPI → React Query hooks)

## Where things live

- `lib/api-spec/openapi.yaml` — API kontratının tek kaynağı
- `lib/db/src/schema/` — users.ts, projects.ts Drizzle tabloları
- `artifacts/api-server/src/routes/` — auth, stats, projects, student, admin
- `artifacts/proje-vitrini/src/` — React frontend

## Architecture decisions

- Firebase yerine Express session + PostgreSQL kullanıldı (Replit altyapısıyla uyumlu)
- OpenAPI-first: tüm tipler ve hook'lar Orval ile generate edilir, elle yazılmaz
- Admin rol kontrolü session tabanlı middleware ile yapılır
- Dizi alanları (techStack, aiTools vb.) PostgreSQL text[] olarak saklanır

## Product

- **Vitrin** (`/`): Hero stats + filtreli proje grid'i (şehir, kategori, aşama)
- **Proje Detayı** (`/projects/:id`): Problem/Çözüm, YZ Kullanım Beyanı, Güvenlik/Etik bölümü
- **Kayıt/Giriş** (`/register`, `/login`): E-posta + şifre
- **Öğrenci Paneli** (`/dashboard`): Proje listesi, durum takibi
- **Proje Gönderimi** (`/dashboard/submit`): 4 adımlı form (Temel Bilgi → Medya → Tech/Linkler → YZ & Etik)
- **Admin Paneli** (`/admin`): İnceleme kuyruğu, onay/ret akışı

## User preferences

_Populate as you build._

## Gotchas

- Codegen'den sonra mutlaka `pnpm run typecheck:libs` çalıştır; aksi halde api-server stale tipler görür
- PostgreSQL array kolonları: `text("col").array()` syntax; JSON string olarak geçme
- Express 5'te wildcard route: `/{*splat}` gerekli, `*` değil
