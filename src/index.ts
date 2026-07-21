import express from "express";
import { middlewareLogResponses, middlewareMetricsInc } from "./api/middleware.js";
import { handlerReadiness } from "./api/handlers.js";
import { handlerMetrics } from "./api/metrics.js";
import { handlerReset } from "./api/reset.js";

const app = express();
const PORT = 8080;

app.use(middlewareLogResponses);
app.use("/app", middlewareMetricsInc, express.static("./src/app")); 

app.get("/api/healthz", handlerReadiness);
app.get("/admin/metrics", handlerMetrics);
app.get("/admin/reset", handlerReset);

app.listen(PORT, () => {
    console.log(`Server is running at https://localhost:${PORT}`);
});
