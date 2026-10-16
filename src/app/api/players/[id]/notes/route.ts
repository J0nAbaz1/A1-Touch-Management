import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { playerNotes } from "@/db/schema";
import { getSessionUser, PERMISSIONS } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const playerId = parseInt(id, 10);
    if (isNaN(playerId)) {
      return NextResponse.json({ error: "Invalid player ID" }, { status: 400 });
    }

    const user = await getSessionUser();
    // Only management can add private notes
    if (user && user.role === "PLAYER") {
      return NextResponse.json({ error: "Players cannot add manager notes" }, { status: 403 });
    }

    const body = await req.json();
    const { note } = body;

    if (!note || !note.trim()) {
      return NextResponse.json({ error: "Note content cannot be empty" }, { status: 400 });
    }

    const authorName = user?.displayName || "Head Coach Marcus";
    const authorRole = user?.role || "MANAGER";

    const [newNote] = await db
      .insert(playerNotes)
      .values({
        playerId,
        authorName,
        authorRole,
        note: note.trim(),
      })
      .returning();

    return NextResponse.json({ ok: true, note: newNote });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to create note" }, { status: 500 });
  }
}
