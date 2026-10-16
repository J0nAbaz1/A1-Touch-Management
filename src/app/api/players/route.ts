import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { players, users, playerStats } from "@/db/schema";
import { eq, ilike, or, and, gte, lte, desc, asc } from "drizzle-orm";
import { hashPassword, getSessionUser } from "@/lib/auth";
import { Position, AvailabilityStatus, SquadStatus, PreferredFoot } from "@/lib/types";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await seedDatabaseIfEmpty();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const position = searchParams.get("position") || "ALL";
    const availability = searchParams.get("availability") || "ALL";
    const formFilter = searchParams.get("form") || "ALL";
    const squadStatus = searchParams.get("squadStatus") || "ALL";

    let allPlayers = await db.select().from(players).orderBy(desc(players.formRating), asc(players.displayName));

    let filtered = allPlayers;

    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.displayName.toLowerCase().includes(q) ||
          p.eaFcUsername.toLowerCase().includes(q) ||
          p.discordUsername.toLowerCase().includes(q)
      );
    }

    if (position !== "ALL") {
      filtered = filtered.filter(
        (p) =>
          p.mainPosition === position ||
          p.secondaryPosition === position ||
          p.thirdPosition === position
      );
    }

    if (availability !== "ALL") {
      filtered = filtered.filter((p) => p.availability === availability);
    }

    if (squadStatus !== "ALL") {
      filtered = filtered.filter((p) => p.squadStatus === squadStatus);
    }

    if (formFilter !== "ALL") {
      filtered = filtered.filter((p) => {
        const f = p.formRating;
        if (formFilter === "EXCELLENT") return f >= 90;
        if (formFilter === "VERY_GOOD") return f >= 80 && f < 90;
        if (formFilter === "GOOD") return f >= 70 && f < 80;
        if (formFilter === "AVERAGE") return f >= 60 && f < 70;
        if (formFilter === "POOR") return f < 60;
        return true;
      });
    }

    return NextResponse.json({ players: filtered, count: filtered.length });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to fetch players" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await seedDatabaseIfEmpty();
    const body = await req.json();

    const {
      displayName,
      discordUsername,
      eaFcUsername,
      mainPosition,
      secondaryPosition,
      thirdPosition,
      preferredFoot,
      playerNumber,
      availability,
      availabilityReason,
      availableAfter,
      bio,
      password,
    } = body;

    // Validate required fields according to spec
    if (!displayName?.trim()) {
      return NextResponse.json({ error: "Display name is required" }, { status: 400 });
    }
    if (!discordUsername?.trim()) {
      return NextResponse.json({ error: "Discord username is required" }, { status: 400 });
    }
    if (!eaFcUsername?.trim()) {
      return NextResponse.json({ error: "EA FC username is required" }, { status: 400 });
    }
    if (!mainPosition) {
      return NextResponse.json({ error: "Main position is required" }, { status: 400 });
    }
    if (!secondaryPosition) {
      return NextResponse.json({ error: "Secondary position is required" }, { status: 400 });
    }

    const numberVal = parseInt(playerNumber, 10);
    const validNumber = !isNaN(numberVal) && numberVal >= 1 && numberVal <= 99 ? numberVal : Math.floor(Math.random() * 80) + 10;

    const chosenPassword = password && password.trim().length >= 4 ? password.trim() : "a1touch2027";
    const passwordHash = await hashPassword(chosenPassword);

    const safeUsername = eaFcUsername.toLowerCase().replace(/[^a-z0-9]/g, "_").slice(0, 40) + "_" + Math.floor(Math.random() * 1000);

    const [user] = await db
      .insert(users)
      .values({
        username: safeUsername,
        displayName: displayName.trim(),
        passwordHash,
        role: "PLAYER",
      })
      .returning();

    const [newPlayer] = await db
      .insert(players)
      .values({
        userId: user.id,
        displayName: displayName.trim(),
        discordUsername: discordUsername.trim(),
        eaFcUsername: eaFcUsername.trim(),
        mainPosition: mainPosition as Position,
        secondaryPosition: secondaryPosition as Position,
        thirdPosition: thirdPosition ? (thirdPosition as Position) : null,
        preferredFoot: (preferredFoot || "Right") as PreferredFoot,
        playerNumber: validNumber,
        availability: (availability || "AVAILABLE") as AvailabilityStatus,
        availabilityReason: availabilityReason?.trim() || null,
        availableAfter: availableAfter?.trim() || null,
        formRating: 75, // initial default form rating
        squadStatus: "RESERVE",
        bio: bio?.trim() || null,
      })
      .returning();

    await db.update(users).set({ playerId: newPlayer.id }).where(eq(users.id, user.id));

    // Initialize future-proof stats
    await db.insert(playerStats).values({
      playerId: newPlayer.id,
      games: 0,
      goals: 0,
      assists: 0,
      wins: 0,
      losses: 0,
      draws: 0,
      cleanSheets: 0,
      motm: 0,
      avgRating: "7.0",
      recentRatings: [7.0],
    });

    return NextResponse.json({
      ok: true,
      player: newPlayer,
      createdUsername: safeUsername,
      message: "Player registered successfully! Welcome to A1 Touch FC.",
    });
  } catch (error: any) {
    console.error("Error creating player:", error);
    return NextResponse.json({ error: error?.message || "Registration failed" }, { status: 500 });
  }
}
