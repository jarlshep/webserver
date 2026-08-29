import { checkUserByEmail } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { checkPasswordHash } from "./auth.js";
import { BadRequestError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { Request, Response } from "express";

export async function handlerUserLogin(req: Request, res: Response): Promise<void> {
    
    type parameters = {
        password: string;
        email: string;
    };

    type UserSafe = Omit<NewUser, "hashedPassword">;

    const params: parameters = req.body;
    if (!params.email) {
        throw new BadRequestError("No email address or password");
    }

    const userUnsafe = await checkUserByEmail(params.email);

    const isPwCorrect = await checkPasswordHash(userUnsafe.hashedPassword, params.password);

    if (isPwCorrect) {
        const userReturn: UserSafe = {
            "id": userUnsafe.id,
            "email": userUnsafe.email,
            "createdAt": userUnsafe.createdAt,
            "updatedAt": userUnsafe.updatedAt,
        }
        respondWithJSON(res, 200, userReturn);
    } else {
        respondWithError(res, 401, `incorrect email or password`);
    }
}