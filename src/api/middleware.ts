import { NextFunction, Request, Response } from "express";
import { config } from "../config.js";

export function middlewareLogResponses(req: Request, res: Response, next: NextFunction) {
    res.on("finish", () => {
        const code: number = Number(res.statusCode);
        if (code < 200 || code >= 300) {
            console.log(`[NON-OK] ${req.method} ${req.url} - Status: ${code}`);
        }
    });
    next();
}

export function middlewareMetricsInc(_: Request, __: Response, next: NextFunction) {
  config.fileserverHits++;
  next();
}
