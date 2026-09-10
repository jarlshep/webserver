import { Request, Response } from "express";
import { NotFoundError } from "./errors.js";
import { getRefreshTokenInfo, insertRowRefreshToken, revokeToken } from "../db/queries/refresh_revoke.js";
import { getBearerToken, makeJWT, validateJWT } from "./auth.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { config } from "../config.js";

export async function handlerRefresh(req: Request, res: Response): Promise<void> {

	const refreshToken = await extractRefreshToken(req);

	const refreshRowInfo = await getRefreshTokenInfo(refreshToken);

	if (refreshRowInfo === undefined) {
		respondWithError(res, 401, "no refresh token returned");
		return;
	}

	const expiry =  3600; // 1 hr
	const newAccessToken = makeJWT(refreshRowInfo?.userId, expiry, config.api.secret);

	const now = new Date();
	if (refreshRowInfo?.expiresAt < now || refreshRowInfo?.revokedAt !== null) {
		respondWithError(res, 401, "refresh token expired or revoked");
		return;
	}

	respondWithJSON(res, 200, {
		"token": newAccessToken,
	});
}

export async function extractRefreshToken(req: Request): Promise<string> {
	let tokenFull: string | undefined;
	let tokenSplit: string[] = [];

	tokenFull = req.get("Authorization");
	if (!tokenFull) {
		throw new NotFoundError("No refresh token sent");
	}

	if (typeof tokenFull === "string" && tokenFull !== "") {
		tokenSplit = tokenFull.split(" ");
	}

	if (tokenSplit[1] !== "") {
		return tokenSplit[1];
	} else {
		throw new NotFoundError("Refresh token empty");
	}
}

export async function handlerRevoke(req: Request, res: Response): Promise<void> {
	const refreshToken = await extractRefreshToken(req);
	const isRevoked = await revokeToken(refreshToken);

	if (isRevoked) {
		const ret = {};
		respondWithJSON(res, 204, ret);
	} else {
		respondWithError(res, 401, `incorrect email or password`);
	}
}