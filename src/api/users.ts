import { Request, Response } from "express";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { checkUserId, createUser, updateChirpyRed, updateUserEmailAndPW } from "../db/queries/users.js";
import { getBearerToken, hashPassword, validateJWT } from "./auth.js";
import { NewUser } from "../db/schema.js";
import { config } from "../config.js";
import { UUID } from "node:crypto";

export async function handlerUsersCreate(req: Request, res: Response): Promise<void> {

    type parameters = {
        password: string;
        email: string;
    };

    type UserSafe = Omit<NewUser, "hashedPassword">;

    // no validation of address
    const params: parameters = req.body;

    if (!params.email) {
        throw new BadRequestError("No email address or password");
    }

    //hash
    const hashed = await hashPassword(params.password);
    if (!hashed) {
        throw new Error("password not processed correctly");
    }

    const userUnsafe = await createUser({ email: params.email, hashedPassword: hashed });

    const userReturn: UserSafe = {
        "id": userUnsafe.id,
        "createdAt": userUnsafe.createdAt,
        "updatedAt": userUnsafe.updatedAt,
        "email": userUnsafe.email,
        "isChirpyRed": userUnsafe.isChirpyRed,
    }

    respondWithJSON(res, 201, userReturn);
}

export async function handlerUpdatePassword(req: Request, res: Response): Promise<void> {

    type parameters = {
        password: string;
        email: string;
    };

    const bearerToken = await getBearerToken(req);

    if (bearerToken === "0") {
        respondWithError(res, 401, "Malformed auth token");
        return;
    }

    const id = validateJWT(bearerToken, config.api.secret);
    if (!id || typeof id !== "string") {
        throw new UserNotAuthenticatedError("User token not valid");
    }

    const idUUID = id as UUID;

    const userInfo: UserSafe = await checkUserId(idUUID);
    if (!userInfo) {
        throw new UserNotAuthenticatedError("User token not valid_2");
    }

    type UserSafe = Omit<NewUser, "hashedPassword">;

    const params: parameters = req.body;

    if (!params.email) {
        throw new BadRequestError("No email address or password");
    }

    //hash new pw
    const hashed = await hashPassword(params.password);
    if (!hashed) {
        throw new Error("password not processed correctly");
    }

    const userUnsafe = await updateUserEmailAndPW(params.email, hashed, idUUID);

    const userReturn: UserSafe = {
        "id": userUnsafe.id,
        "createdAt": userUnsafe.createdAt,
        "updatedAt": userUnsafe.updatedAt,
        "email": userUnsafe.email,
        "isChirpyRed": userUnsafe.isChirpyRed,
    }

    if (!userReturn) {
        respondWithError(res, 401, "Password update unsuccessful");
        return;
    } else {
        respondWithJSON(res, 200, userReturn);
        return;
    }
}

export async function handlerUpdateUserChirpyRed(req: Request, res: Response): Promise<void> {

    type parameters = {
        event: string;
        data: { 
            userId: UUID; 
        };
    };

    type UserSafe = Omit<NewUser, "hashedPassword">;

    const params: parameters = req.body;

    if (params.event !== "user.upgraded") {
        respondWithError(res, 204, "Request not for user.upgraded");
        return;
    }

    const userInfo: UserSafe = await updateChirpyRed(params.data.userId);
    if (!userInfo) {
        respondWithError(res, 404, "User not found for user.upgraded");
        return;
    } else {
        respondWithJSON(res, 204, "");
        return;
    }
}