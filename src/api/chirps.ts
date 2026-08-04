import { Request, Response } from "express";
import { respondWithError, respondWithJSON } from "./json.js";
import { BadRequestError } from "./errors.js";

export async function handlerChirpsValidate(req: Request, res: Response): Promise<void> {
    type parameters = {
        body: string;
    };

    const params: parameters = req.body;

    const maxChirpLength = 140;
    if (params.body.length > maxChirpLength) {
        throw new BadRequestError("Chirp is too long. Max length is 140");
    }

    const clean: string = censorShip(params.body);

    respondWithJSON(res, 200, {
        cleanedBody: clean,
    });
}

function censorShip(body: string): string {
    let cleanArr: string[] = [];
    const censorList = ["kerfuffle", "sharbert", "fornax"];

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
function next(): import("express").NextFunction {
    throw new Error("Function not implemented.");
}

