import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players, squadLineups } from "@/db/schema";
import { eq } from "drizzle-orm";
import { rankPlayersForPosition } from "@/lib/recommendation";
import { Player, PitchSlot } from "@/lib/types";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await seedDatabaseIfEmpty();
    const { searchParams } = new URL(req.url);
    const position = searchParams.get("position") || "ST";

    const allPlayersRaw = await db.select().from(players);
    const allPlayers: Player[] = allPlayersRaw.map((p) => ({
      ...p,
      mainPosition: p.mainPosition as any,
      secondaryPosition: p.secondaryPosition as any,
      thirdPosition: p.thirdPosition as any,
      preferredFoot: p.preferredFoot as any,
      availability: p.availability as any,
      squadStatus: p.squadStatus as any,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));

    // Retrieve active lineup to check who is already assigned
    const [lineup] = await db.select().from(squadLineups).where(eq(squadLineups.isActive, true)).limit(1);
    const assignedSlots = ((lineup?.startingSlots as PitchSlot[]) || []).map((s) => ({
      slotId: s.slotId,
      playerId: s.playerId,
      label: s.label,
    }));

    const recommendations = rankPlayersForPosition(position, allPlayers, assignedSlots);

    return NextResponse.json({
      position,
      totalCount: recommendations.length,
      recommendations,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to calculate recommendations" }, { status: 500 });
  }
}
