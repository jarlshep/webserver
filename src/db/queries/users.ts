import { UUID } from "node:crypto";
import { db } from "../index.js";
import { NewUser, users } from "../schema.js";
import { eq } from "drizzle-orm";

export async function createUser(user: NewUser) {
  const [result] = await db.insert(users).values(user).onConflictDoNothing().returning();
  return result;
}

export async function checkUserId(userID: UUID) {
  const [result] = await db.select().from(users).where(eq(users.id, userID));
  return result;
}