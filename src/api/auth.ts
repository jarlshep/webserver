import argon2 from "argon2";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import { BadRequestError, NotFoundError, UserNotAuthenticatedError } from "./errors.js";
import { Request } from "express";
import crypto from "node:crypto";
import { respondWithError } from "./json.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

const TOKEN_ISSUER = "chirpy";

export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
}

export async function checkPasswordHash(hash: string, password: string): Promise<boolean> {
    if (!password) return false;
    try {
        return await argon2.verify(hash, password);
    } catch (error) {
        return false;
    }
} 

export function makeJWT(userID: string, expiresIn: number, secret: string) {
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + expiresIn;
    const token = jwt.sign(
        {
            iss: TOKEN_ISSUER,
            sub: userID,
            iat: issuedAt,
            exp: expiresAt,
        } satisfies payload,
        secret,
        { algorithm: "HS256" },
    );
    return token;
}

export function validateJWT(tokenString: string, secret: string) {
	let decoded: payload;
	try {
		decoded = jwt.verify(tokenString, secret) as JwtPayload;
	} catch (e) {
		throw new UserNotAuthenticatedError("Invalid token");
	}

	if (decoded.iss !== TOKEN_ISSUER) {
		throw new UserNotAuthenticatedError("Invalid issuer");
	}

	if (!decoded.sub) {
		throw new UserNotAuthenticatedError("No user ID in token");
	}

	return decoded.sub;
}

export async function getBearerToken(req: Request): Promise<string> {
	let headerFull: string | undefined;
	let headerSplit: string[] = [];

	headerFull = req.get("Authorization");
	if (!headerFull) {
		return "0";
	}

	if (typeof headerFull === "string" && headerFull !== "") {
		headerSplit = headerFull.split(" ");
	}

	const tokenSplit = headerSplit[1].split(".");
	if (headerSplit[0] !== "Bearer" || tokenSplit.length !== 3) {
		return "0";
	} else {
		return headerSplit[1];
	}
}

export function makeRefreshToken(): string {
	return crypto.randomBytes(32).toString("hex");
}
