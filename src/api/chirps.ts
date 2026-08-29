import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";
import { UUID } from "node:crypto";
import { createChirp, getAllChirps, getOneChirp } from "../db/queries/chirps.js";
import { checkUserId } from "../db/queries/users.js";

export async function handlerChirpsCreate(req: Request, res: Response): Promise<void> {
    type parameters = {
        body: string;
        userId: UUID; // the variable name has to match the incoming JSON, which is not how I use it elsewhere and in my schema. Just needs to match in this function, and it will be irrelevant elsewhere.
    };

    const params: parameters = req.body;

    // validity logic
    /* const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    } */
    const cleanBody: string = censorShip(params.body);
    /* if (await checkUserId(params.userID)) {
        throw new BadRequestError("invalid userID");
    } */
    // end validity logic

    /* const chirp = await createChirp(cleanBody, params.userId);

    respondWithJSON(res, 201, {
        body: cleanBody,
        userId: chirpResp.userID
    }); */

    const chirp = await createChirp(cleanBody, params.userId);
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

export async function handlerGetChirps(req: Request, res: Response): Promise<void> {
    const allChirps = await getAllChirps();

    respondWithJSON(res, 200, allChirps);
} 

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

function next(): import("express").NextFunction {
    throw new Error("Function not implemented.");
}

