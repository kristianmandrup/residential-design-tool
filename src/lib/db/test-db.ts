// test-db.ts
import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

async function testConnection() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool, { schema });
  const result = await db.select().from(schema.projects);
  console.log(result);
  await pool.end();
}

testConnection().catch(console.error);
