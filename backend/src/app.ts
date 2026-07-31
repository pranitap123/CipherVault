import express from "express";

import healthRouter from "./routes/health.route.js";
import authRouter from "./auth/authRouter.js";
import fileRouter from "./files/filesRouter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./middlewares/logger.js";

const app = express();

app.use(express.json());

app.use(logger);
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/files", fileRouter);

app.use(errorHandler);

export default app;