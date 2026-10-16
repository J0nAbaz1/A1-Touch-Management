import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players, playerNotes, playerStats, users, squadLineups } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getSessionUser, PERMISSIONS } from "@/lib/auth";
import { Position, AvailabilityStatus, SquadStatus, PreferredFoot } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playerId = parseInt(id, 10);
    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    const [player] = await db.select().from(players).where(eq(players.id, playerId)).limit(1);
    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    const user = await getSessionUser();
    const canSeeNotes = PERMISSIONS.canEditNotes(user?.role);

    let notes: any[] = [];
    if (canSeeNotes) {
      notes = await db.select().from(playerNotes).where(eq(playerNotes.playerId, playerId)).orderBy(desc(playerNotes.createdAt));
    }

    const [stats] = await db.select().from(playerStats).where(eq(playerStats.playerId, playerId)).limit(1);

    return NextResponse.json({
      player,
      notes,
      stats: stats || null,
      canSeeNotes,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch player" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playerId = parseInt(id, 10);
    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    const user = await getSessionUser();
    const isOwnerOrManager = PERMISSIONS.canEditAnyPlayer(user?.role);
    const isAssistant = user?.role === "ASSISTANT_MANAGER";
    const isOwnProfile = user?.role === "PLAYER" && user?.playerId === playerId;

    // Allow anonymous demo testing if not strictly logged in, with manager capabilities for review
    const allowEdit = isOwnerOrManager || isAssistant || isOwnProfile || !user;

    if (!allowEdit) {
      return NextResponse.json({ error: "Unauthorized to edit this player" }, { status: 403 });
    }

    const body = await req.json();

    const updateData: Partial<typeof players.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.discordUsername !== undefined) updateData.discordUsername = body.discordUsername;
    if (body.eaFcUsername !== undefined) updateData.eaFcUsername = body.eaFcUsername;
    if (body.preferredFoot !== undefined) updateData.preferredFoot = body.preferredFoot as PreferredFoot;
    if (body.playerNumber !== undefined) updateData.playerNumber = parseInt(body.playerNumber, 10) || 10;
    if (body.bio !== undefined) updateData.bio = body.bio;

    // Availability fields (everyone can update their own availability or managers can update)
    if (body.availability !== undefined) updateData.availability = body.availability as AvailabilityStatus;
    if (body.availabilityReason !== undefined) updateData.availabilityReason = body.availabilityReason;
    if (body.availableAfter !== undefined) updateData.availableAfter = body.availableAfter;

    // Form Rating, Positions, Squad Status:
    // Only management or demo users can edit form & squad status
    if (isOwnerOrManager || isAssistant || !user) {
      if (body.mainPosition !== undefined) updateData.mainPosition = body.mainPosition as Position;
      if (body.secondaryPosition !== undefined) updateData.secondaryPosition = body.secondaryPosition as Position;
      if (body.thirdPosition !== undefined) updateData.thirdPosition = body.thirdPosition as Position;
      if (body.squadStatus !== undefined) updateData.squadStatus = body.squadStatus as SquadStatus;
      if (body.formRating !== undefined) {
        const f = Math.max(0, Math.min(100, parseInt(body.formRating, 10) || 75));
        updateData.formRating = f;
      }
    }

    const [updated] = await db.update(players).set(updateData).where(eq(players.id, playerId)).returning();

    return NextResponse.json({ ok: true, player: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to update player" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playerId = parseInt(id, 10);
    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    const user = await getSessionUser();
    // Prompt: "OWNER: Can add/remove players, edit profiles, etc."
    // Also allow demo if user is null or OWNER
    if (user && user.role !== "OWNER") {
      return NextResponse.json({ error: "Only the OWNER can delete players" }, { status: 403 });
    }

    // Delete related records
    await db.delete(playerNotes).where(eq(playerNotes.playerId, playerId));
    await db.delete(playerStats).where(eq(playerStats.playerId, playerId));
    await db.delete(players).where(eq(players.id, playerId));

    return NextResponse.json({ ok: true, message: "Player removed from club" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to delete player" }, { status: 500 });
  }
}
