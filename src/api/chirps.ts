import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError, UserNotAuthenticatedError } from "./errors.js";
import { UUID } from "node:crypto";
import { createChirp, deleteOneChirp, getAllChirps, getAuthorsChirps, getOneChirp } from "../db/queries/chirps.js";
import { checkUserId } from "../db/queries/users.js";
import { getBearerToken, validateJWT } from "./auth.js";
import { config } from "../config.js";
import { NewUser } from "../db/schema.js";

export async function handlerChirpsCreate(req: Request, res: Response): Promise<void> {
    type parameters = {
        body: string;
        // userId: UUID;
    };

    type UserSafe = Omit<NewUser, "hashedPassword">;

    const params: parameters = req.body;

    const bearerToken = await getBearerToken(req);

    const id = validateJWT(bearerToken, config.api.secret);
    if (!id || typeof id !== "string") {
        throw new UserNotAuthenticatedError("User token not valid");
    }

    const idUUID = id as UUID; // cast id as UUID to make sure query works, since schema declares users.id as a UUID

    const userInfo: UserSafe = await checkUserId(idUUID);
    if (!userInfo) {
        throw new UserNotAuthenticatedError("User token not valid_2");
    }

    const cleanBody: string = censorShip(params.body);

    const chirp = await createChirp(cleanBody, idUUID);
    respondWithJSON(res, 201, chirp);
}

function censorShip(body: string): string {
    let cleanArr: string[] = [];
    const censorList = ["kerfuffle", "sharbert", "fornax"];

    const maxChirpLength = 140;
    if (body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const splitBody = body.split(" ");
    
    for (let i = 0; i < splitBody.length; i++) {
        if (censorList.includes(splitBody[i].toLowerCase())) {
            cleanArr.push("****");
        } else {
            cleanArr.push(splitBody[i]);
        }
    }

    const cleanStr: string = cleanArr.join(" ");
    return cleanStr;
}

/* export async function handlerGetChirps(req: Request, res: Response): Promise<void> {
    const allChirps = await getAllChirps();

    respondWithJSON(res, 200, allChirps);
}  */

export async function handlerGetOneChirp(req: Request, res: Response): Promise<void> {
    if (typeof req.params.chirpId !== "string") {
        throw new BadRequestError("Invalid chirpID");
    }

    const id: string = req.params.chirpId;

    const chirp = await getOneChirp(id);

    if (chirp) {
        respondWithJSON(res, 200, chirp);
    } else {
        respondWithError(res, 404, `No chirp with id ${id}`);
    }
}

export async function handlerDeleteChirp(req: Request, res: Response): Promise<void> {
    
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

    type UserSafe = Omit<NewUser, "hashedPassword">;

    const userInfo: UserSafe = await checkUserId(idUUID);
    if (!userInfo) {
        throw new UserNotAuthenticatedError("User token not valid_2");
    }
    
    if (typeof req.params.chirpId !== "string") {
        throw new BadRequestError("Invalid chirpID, deletion not possible");
    }

    const chirpId: string = req.params.chirpId;

    const chirpToDelete = await getOneChirp(chirpId);

    if (chirpToDelete?.userId !== userInfo.id) {
        respondWithError(res, 403, `User not authorized to delete chirp`);
        return;
    }

    const deletedChirp = await deleteOneChirp(chirpId);

    if (deletedChirp) {
        const ret = {};
		respondWithJSON(res, 204, ret);
    } else {
        respondWithError(res, 404, `No chirp with id ${chirpId} found for deletion`);
    }
}

export async function handlerAllOrAuthorChirps(req: Request, res: Response): Promise<void> {
    let authorId = "";
    let authorIdQuery = req.query.authorId;
    if (typeof authorIdQuery === "string") {
        authorId = authorIdQuery;
    }

    if (!authorId) {
        const chirps = await getAllChirps();
        respondWithJSON(res, 200, chirps);
        return;
    } else if (typeof authorId === "string") {
        const chirps = await getAuthorsChirps(authorId);
        respondWithJSON(res, 200, chirps);
        return;
    } else {
        respondWithError(res, 404, `No author with id ${authorId}`);
        return;
    }
}

function next(): import("express").NextFunction {
    throw new Error("Function not implemented.");
}

