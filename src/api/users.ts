import { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import { createUser } from "../db/queries/users.js";
import { hashPassword } from "./auth.js";
import { NewUser } from "../db/schema.js";

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
        "email": userUnsafe.email,
        "createdAt": userUnsafe.createdAt,
        "updatedAt": userUnsafe.updatedAt,
    }

    respondWithJSON(res, 201, userReturn);
}