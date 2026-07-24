import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

const needsSsl =
  process.env.DATABASE_URL.includes("supabase.co") ||
  process.env.DATABASE_URL.includes("supabase.com") ||
  process.env.DB_SSL === "true";

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
    ssl: needsSsl ? "require" : undefined,
  },
});
