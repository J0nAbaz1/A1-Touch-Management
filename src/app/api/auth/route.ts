import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { users, players } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword, hashPassword, getSessionUser, createSessionCookieValue } from "@/lib/auth";
import { AuthUser, Role } from "@/lib/types";
import { seedDatabaseIfEmpty } from "@/lib/seed";

export const dynamic = "force-dynamic";

export async function GET() {
  await seedDatabaseIfEmpty();
  const user = await getSessionUser();
  return NextResponse.json({ user });
}

export async function POST(req: NextRequest) {
  try {
    await seedDatabaseIfEmpty();
    const body = await req.json();
    const { action, username, password, targetRole } = body;

    // Quick Role Switcher for instant testing
    if (action === "quick_switch" && targetRole) {
      const validRoles: Role[] = ["OWNER", "MANAGER", "ASSISTANT_MANAGER", "PLAYER"];
      if (!validRoles.includes(targetRole)) {
        return NextResponse.json({ error: "Invalid role" }, { status: 400 });
      }

      // Find an existing user with this role
      let userList = await db.select().from(users).where(eq(users.role, targetRole)).limit(1);

      let targetUser = userList[0];
      if (!targetUser) {
        // Fallback or create demo user for role
        const defaultHash = await hashPassword("a1touch2027");
        const [created] = await db
          .insert(users)
          .values({
            username: `demo_${targetRole.toLowerCase()}`,
            displayName: `A1 ${targetRole.replace("_", " ")}`,
            passwordHash: defaultHash,
            role: targetRole,
          })
          .returning();
        targetUser = created;
      }

      const authUser: AuthUser = {
        id: targetUser.id,
        username: targetUser.username,
        displayName: targetUser.displayName,
        role: targetUser.role as Role,
        playerId: targetUser.playerId,
      };

      const res = NextResponse.json({ ok: true, user: authUser });
      res.cookies.set("a1_session", createSessionCookieValue(authUser), {
        httpOnly: true,
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      });
      return res;
    }

    // Standard credential login
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }

    const [user] = await db.select().from(users).where(eq(users.username, username.trim().toLowerCase())).limit(1);
    if (!user) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const valid = await verifyPassword(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Invalid username or password" }, { status: 401 });
    }

    const authUser: AuthUser = {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role as Role,
      playerId: user.playerId,
    };

    const res = NextResponse.json({ ok: true, user: authUser });
    res.cookies.set("a1_session", createSessionCookieValue(authUser), {
      httpOnly: true,
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set("a1_session", "", {
    httpOnly: true,
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });
  return res;
}
