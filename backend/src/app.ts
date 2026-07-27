import express from "express";

import healthRouter from "./routes/health.route.js";
import authRouter from "./auth/authRouter.js";
import fileRouter from "./files/filesRouter.js";

const app = express();

app.use(express.json());

app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/files", fileRouter);

export default app;