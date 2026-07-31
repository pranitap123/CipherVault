import express from "express";

import healthRouter from "./routes/health.route.js";
import authRouter from "./auth/authRouter.js";
import fileRouter from "./files/filesRouter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./middlewares/logger.js";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";

const app = express();

app.use(helmet());

app.use(cors());

app.use(compression());

app.use(express.json());

app.use(logger);
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/files", fileRouter);

app.use(errorHandler);

export default app;