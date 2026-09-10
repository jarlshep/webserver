import { config } from "../config.js";
import { insertRowRefreshToken } from "../db/queries/refresh_revoke.js";
import { checkUserByEmail } from "../db/queries/users.js";
import { NewUser } from "../db/schema.js";
import { checkPasswordHash, makeJWT, makeRefreshToken } from "./auth.js";
import { BadRequestError } from "./errors.js";
import { respondWithError, respondWithJSON } from "./json.js";
import { Request, Response } from "express";

export async function handlerUserLogin(req: Request, res: Response): Promise<void> {
    
    type parameters = {
        password: string;
        email: string;
    };

    type UserSafe = Omit<NewUser, "hashedPassword">;

    type UserWithTokens = UserSafe & {
        token: string;
        refreshToken: string;
    }

    const params: parameters = req.body;
    if (!params.email) {
        throw new BadRequestError("No email address or password");
    }

    const userUnsafe = await checkUserByEmail(params.email);

    let expiry: number = 3600;

    const isPwCorrect = await checkPasswordHash(userUnsafe.hashedPassword, params.password);
    
    const token = makeJWT(userUnsafe.id, expiry, config.api.secret);
    
    const refreshToken = makeRefreshToken();
    // const refreshRowInfo = insertRowRefreshToken(userUnsafe.id, refreshToken);
    insertRowRefreshToken(userUnsafe.id, refreshToken);

    if (isPwCorrect) {
        const userReturn: UserWithTokens = {
            "id": userUnsafe.id,
            "email": userUnsafe.email,
            "createdAt": userUnsafe.createdAt,
            "updatedAt": userUnsafe.updatedAt,
            "token": token,
            "refreshToken": refreshToken,
        }
        respondWithJSON(res, 200, userReturn);
    } else {
        respondWithError(res, 401, `incorrect email or password`);
    }
}