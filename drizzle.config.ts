import type { Config } from "drizzle-kit";

export default {
  schema: "./src/lib/db/schema.ts",
  out: "./migrations",
  dialect: "postgresql",
  dbCredentials: {
    host: process.env.DATABASE_HOST || "localhost",
    port: parseInt(process.env.DATABASE_PORT || "5432"),
    user: process.env.DATABASE_USER || "user",
    password: process.env.DATABASE_PASSWORD || "password",
    database: process.env.DATABASE_NAME || "residential-designer",
  },
} satisfies Config;
