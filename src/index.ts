import express from "express";
import { middlewareLogResponses, middlewareMetricsInc, errorMiddleware } from "./api/middleware.js";
import { handlerReadiness } from "./api/handlers.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerAllOrAuthorChirpsSort, handlerChirpsCreate, handlerDeleteChirp, handlerGetOneChirp } from "./api/chirps.js";
import postgres from "postgres";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { drizzle } from "drizzle-orm/postgres-js";
import { config } from "./config.js";
import { handlerUpdatePassword, handlerUpdateUserChirpyRed, handlerUsersCreate } from "./api/users.js";
import { handlerUserLogin } from "./api/login.js";
import { handlerRefresh, handlerRevoke } from "./api/refresh_revoke.js";

const migrationClient = postgres(config.db.url, { max: 1 });
await migrate(drizzle(migrationClient), config.db.migrationConfig);

const app = express();

app.use(middlewareLogResponses);
app.use(express.json());

app.use("/app", middlewareMetricsInc, express.static("./src/app"));

app.get("/api/healthz", (req, res, next) => {
    Promise.resolve(handlerReadiness(req, res)).catch(next);
});
app.get("/admin/metrics", (req, res, next) => {
    Promise.resolve(handlerMetrics(req, res)).catch(next);
});
/* app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerGetChirps(req, res)).catch(next);
}); */
app.get("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerAllOrAuthorChirpsSort(req, res)).catch(next);
});
app.get("/api/chirps/:chirpId", (req, res, next) => {
    Promise.resolve(handlerGetOneChirp(req, res)).catch(next);
});
app.post("/admin/reset", (req, res, next) => {
    Promise.resolve(handlerReset(req, res)).catch(next);
});
app.post("/api/chirps", (req, res, next) => {
    Promise.resolve(handlerChirpsCreate(req, res)).catch(next);
});
app.post("/api/users", (req, res, next) => {
    Promise.resolve(handlerUsersCreate(req, res)).catch(next);
});
app.post("/api/login", (req, res, next) => {
    Promise.resolve(handlerUserLogin(req, res)).catch(next);
});
app.post("/api/refresh", (req, res, next) => {
    Promise.resolve(handlerRefresh(req, res)).catch(next);
});
app.post("/api/revoke", (req, res, next) => {
    Promise.resolve(handlerRevoke(req, res)).catch(next);
});
app.put("/api/users", (req, res, next) => {
    Promise.resolve(handlerUpdatePassword(req, res)).catch(next);
});
app.delete("/api/chirps/:chirpId", (req, res, next) => {
    Promise.resolve(handlerDeleteChirp(req, res)).catch(next);
});
app.post("/api/polka/webhooks", (req, res, next) => {
    Promise.resolve(handlerUpdateUserChirpyRed(req, res)).catch(next);
});

app.use(errorMiddleware);

app.listen(config.api.port, () => {
    console.log(`Server is running at https://localhost:${config.api.port}`);
});
