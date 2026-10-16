import { db } from "@/db";
import { sql } from "drizzle-orm";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    await seedDatabaseIfEmpty();
    return Response.json({ ok: true, status: "healthy" });
  } catch (error: any) {
    console.error("Health check failure:", error);
    return Response.json({ ok: false, error: error?.message }, { status: 500 });
  }
}
