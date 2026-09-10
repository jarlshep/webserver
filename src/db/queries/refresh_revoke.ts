import { db } from "../index.js";
import { refreshTokens } from "../schema.js";
import { eq } from "drizzle-orm";

export async function insertRowRefreshToken(id: string, refrToken: string) {
	// add 60 days to a timestamp
	let now = new Date();
	const _60DaysinMS = 1000 * 60 * 60 * 24 * 60;
	now.setTime(now.getTime() + _60DaysinMS);

	const [rows] = await db.insert(refreshTokens).values({ userId: id, token: refrToken, expiresAt: now }).returning();
	return rows;
}

export async function getRefreshTokenInfo(refrToken: string) {
	// console.log("refresh token received:", Boolean(refrToken), refrToken?.length);
	const rows = await db.select().from(refreshTokens).where(eq(refreshTokens.token, refrToken));
	if (!rows) {
		// console.log("no refresh rows returned");
		return;
	}
	// console.log("rows: ", rows);
	return rows[0];
}

export async function revokeToken(refrToken: string) {
	const now = new Date();
	const [row] = await db.update(refreshTokens).set({revokedAt: now, updatedAt: now }).where(eq(refreshTokens.token, refrToken)).returning();
	return row;
}