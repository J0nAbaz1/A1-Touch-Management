import { NextResponse } from "next/server";
import { db } from "@/db";
import { players, squadLineups } from "@/db/schema";
import { eq } from "drizzle-orm";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabaseIfEmpty();
    const allPlayers = await db.select().from(players);
    const [lineup] = await db.select().from(squadLineups).where(eq(squadLineups.isActive, true)).limit(1);

    const total = allPlayers.length;
    const available = allPlayers.filter((p) => p.availability === "AVAILABLE").length;
    const maybe = allPlayers.filter((p) => p.availability === "MAYBE").length;
    const unavailable = allPlayers.filter((p) => p.availability === "UNAVAILABLE").length;
    const goodForm = allPlayers.filter((p) => (p.formRating || 0) >= 75).length;

    const startingCount = allPlayers.filter((p) => p.squadStatus === "STARTING_XI").length;
    const benchCount = allPlayers.filter((p) => p.squadStatus === "BENCH").length;
    const reserveCount = allPlayers.filter((p) => p.squadStatus === "RESERVE").length;
    const trialistCount = allPlayers.filter((p) => p.squadStatus === "TRIALIST").length;

    return NextResponse.json({
      formation: lineup?.formation || "4-3-3",
      totalPlayers: total,
      availablePlayers: available,
      maybePlayers: maybe,
      unavailablePlayers: unavailable,
      goodFormPlayers: goodForm,
      squadBreakdown: {
        starting: startingCount,
        bench: benchCount,
        reserves: reserveCount,
        trialists: trialistCount,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to load stats summary" }, { status: 500 });
  }
}
