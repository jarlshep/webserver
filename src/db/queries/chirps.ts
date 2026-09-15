import { UUID } from "node:crypto";
import { db } from "../index.js";
import { chirps } from "../schema.js";
import { asc, eq } from "drizzle-orm";

export async function createChirp(chirpBody: string, id: UUID) {
	const [rows] = await db.insert(chirps).values({ body: chirpBody, userId: id }).returning();
	return rows;
}

export async function getAllChirps() {
	return db.select().from(chirps).orderBy(asc(chirps.createdAt));
}

export async function getOneChirp(chirpID: string) {
	const rows = await db.select().from(chirps).where(eq(chirps.id, chirpID));
	if (rows.length === 0) {
		return;
	}
	return rows[0];
}

export async function deleteOneChirp(chirpID: string) {
	const rows = await db.delete(chirps).where(eq(chirps.id, chirpID)).returning();
	if (rows.length === 0) {
		return;
	}
	return rows[0];
}

export async function getAuthorsChirps(authorId: string) {
	const rows = await db.select().from(chirps).where(eq(chirps.userId, authorId));
	if (rows.length === 0) {
		return;
	}
	return rows;
}