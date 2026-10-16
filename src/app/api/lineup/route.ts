import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { squadLineups, players } from "@/db/schema";
import { eq, desc, inArray } from "drizzle-orm";
import { FORMATIONS } from "@/lib/formations";
import { getSessionUser, PERMISSIONS } from "@/lib/auth";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await seedDatabaseIfEmpty();
    let [lineup] = await db.select().from(squadLineups).where(eq(squadLineups.isActive, true)).limit(1);

    if (!lineup) {
      const defaultFormation = FORMATIONS["4-3-3"];
      const [created] = await db
        .insert(squadLineups)
        .values({
          name: "A1 Touch FC - FC 27 Matchday Starting XI",
          formation: "4-3-3",
          isActive: true,
          startingSlots: defaultFormation.slots,
          benchPlayerIds: [],
          updatedBy: "Head Coach Marcus",
        })
        .returning();
      lineup = created;
    }

    return NextResponse.json({ lineup });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch lineup" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await seedDatabaseIfEmpty();
    const user = await getSessionUser();
    // Prompt: Owner and Manager can create and save Starting XI, Assistant Manager helps
    if (user && user.role === "PLAYER") {
      return NextResponse.json({ error: "Players cannot modify the Starting XI" }, { status: 403 });
    }

    const body = await req.json();
    const { formation, startingSlots, benchPlayerIds, name } = body;

    let [lineup] = await db.select().from(squadLineups).where(eq(squadLineups.isActive, true)).limit(1);

    const updatedBy = user?.displayName || "Head Coach Marcus";

    let savedLineup;
    if (lineup) {
      const [updated] = await db
        .update(squadLineups)
        .set({
          formation: formation || lineup.formation,
          startingSlots: startingSlots !== undefined ? startingSlots : lineup.startingSlots,
          benchPlayerIds: benchPlayerIds !== undefined ? benchPlayerIds : lineup.benchPlayerIds,
          name: name || lineup.name,
          updatedBy,
          updatedAt: new Date(),
        })
        .where(eq(squadLineups.id, lineup.id))
        .returning();
      savedLineup = updated;
    } else {
      const [created] = await db
        .insert(squadLineups)
        .values({
          name: name || "A1 Touch FC Starting XI",
          formation: formation || "4-3-3",
          isActive: true,
          startingSlots: startingSlots || FORMATIONS["4-3-3"].slots,
          benchPlayerIds: benchPlayerIds || [],
          updatedBy,
        })
        .returning();
      savedLineup = created;
    }

    // Automatically sync squad statuses for players
    const startingPlayerIds: number[] = ((savedLineup.startingSlots as any[]) || [])
      .map((s) => s.playerId)
      .filter((id): id is number => typeof id === "number");

    const benchIds: number[] = ((savedLineup.benchPlayerIds as number[]) || []).filter(
      (id): id is number => typeof id === "number"
    );

    // Update starting XI players
    if (startingPlayerIds.length > 0) {
      await db
        .update(players)
        .set({ squadStatus: "STARTING_XI" })
        .where(inArray(players.id, startingPlayerIds));
    }

    // Update bench players
    if (benchIds.length > 0) {
      await db
        .update(players)
        .set({ squadStatus: "BENCH" })
        .where(inArray(players.id, benchIds));
    }

    return NextResponse.json({ ok: true, lineup: savedLineup });
  } catch (error: any) {
    console.error("Lineup update error:", error);
    return NextResponse.json({ error: error?.message || "Failed to update lineup" }, { status: 500 });
  }
}
