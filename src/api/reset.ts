import type { Request, Response } from "express";
import { config } from "../config.js";
import { deleteUsers } from "../db/queries/reset.js";
import { respondWithError } from "./json.js";

process.loadEnvFile();

export async function handlerReset(_: Request, res: Response) {
    if (checkPlatform("PLATFORM") === "OK") {
        deleteUsers();
    } else {
        respondWithError(res, 403, "FORBIDDEN")
    }
    config.api.fileserverHits = 0;
    res.send(`Hits reset to 0\n`);
    res.end();
}

function checkPlatform(key: string) {
    const platform = process.env[key];
    if (platform === "dev") {
        return "OK";
    } else {
      throw new Error(`Env var PLATFORM ${key} must be set to "dev" to perform this operation`);
    }
}