import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { AuthUser, Role } from "./types";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
export { PERMISSIONS } from "./permissions";

const COOKIE_NAME = "a1_session";

export async function hashPassword(plain: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(plain, salt);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

export async function getSessionUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const parsed = JSON.parse(Buffer.from(token, "base64").toString("utf-8"));
    if (!parsed || !parsed.id) return null;

    // Check if user exists in DB
    const [user] = await db.select().from(users).where(eq(users.id, parsed.id)).limit(1);
    if (!user) return null;

    return {
      id: user.id,
      username: user.username,
      displayName: user.displayName,
      role: user.role as Role,
      playerId: user.playerId,
    };
  } catch {
    return null;
  }
}

export function createSessionCookieValue(user: AuthUser): string {
  return Buffer.from(JSON.stringify(user)).toString("base64");
}
