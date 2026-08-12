import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";

export async function handlerUsersCreate(req: Request, res: Response): Promise<void> {

    type parameters = {
        email: string;
    };

    // no validation of address
    const params: parameters = req.body;

    const user = await createUser({ email: params.email });

    if (!params.email) {
        throw new BadRequestError("No email adress");
    }

    respondWithJSON(res, 201, {
        "id": user.id,
        "email": user.email,
        "createdAt": user.createdAt,
        "updatedAt": user.updatedAt,
    });

}