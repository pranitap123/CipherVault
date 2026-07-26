import express from "express";

import healthRouter from "./routes/health.route.js";
import authRouter from "./auth/authRouter.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);

export default app;