import { Request, Response } from "express";
import { config } from "../config.js";

export async function handlerReadiness(req: Request, res: Response): Promise<void> {
    res.set("Content-Type", "text/plain; charset=utf-8");
    res.send("OK");
}

export async function handlerFileserverHits(req: Request, res: Response): Promise<void> {
    res.send(`<html><body><h1>Hits: ${config.fileserverHits}</h1></body></html>`);
}
