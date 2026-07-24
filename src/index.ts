import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handlerReadiness } from "./api/handlers.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";
import { handlerChirpsValidate } from "./api/chirps.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app"));
app.use(express.json());

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.post("/admin/reset", handlerReset);
app.post("/api/validate_chirp", handlerChirpsValidate);

app.listen(PORT, () => {
    console.log(`Server is running at https://localhost:${PORT}`);
});
