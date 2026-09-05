import { config } from "../config.js";
import { checkUserByEmail } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { checkPasswordHash, getBearerToken, makeJWT } from "./auth.js";
import { BadRequestError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { Request, Response } from "express";

export async function handlerUserLogin(req: Request, res: Response): Promise<void> {
    
    type parameters = {
        password: string;
        email: string;
        expiresInSeconds?: number;
    };

    type UserSafe = Omit<NewUser, "hashedPassword">;

    type UserWithToken = UserSafe & {
        token: string;
    }

    const params: parameters = req.body;
    if (!params.email) {
        throw new BadRequestError("No email address or password");
    }

    const userUnsafe = await checkUserByEmail(params.email);

    let expiry: number = 3600;
    if (params.expiresInSeconds) {
        if (params.expiresInSeconds > 3600) {
            expiry = 3600;
        } else {
            expiry = params.expiresInSeconds;
        }
    }

    const isPwCorrect = await checkPasswordHash(userUnsafe.hashedPassword, params.password);
    
    const token = makeJWT(userUnsafe.id, expiry, config.api.secret);

    // const bearerToken = await getBearerToken(req);
    // console.log(`token: ${token}`)

    if (isPwCorrect) {
        const userReturn: UserWithToken = {
            "id": userUnsafe.id,
            "email": userUnsafe.email,
            "createdAt": userUnsafe.createdAt,
            "updatedAt": userUnsafe.updatedAt,
            "token": token,
        }
        respondWithJSON(res, 200, userReturn);
    } else {
        respondWithError(res, 401, `incorrect email or password`);
    }
}