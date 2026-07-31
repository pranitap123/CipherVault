import express from "express";
import healthRouter from "./routes/health.route.js";
import authRouter from "./auth/authRouter.js";
import fileRouter from "./files/filesRouter.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import { logger } from "./middlewares/logger.js";
import helmet from "helmet";
import cors from "cors";
import compression from "compression";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./config/swagger.js";
import { globalRateLimiter } from "./middlewares/rateLimiter.js";

const app = express();

app.use(helmet());

app.use(cors());

app.use(compression());

app.use(express.json());

app.use(globalRateLimiter);

app.use(logger);
app.use(
    "/api-docs",
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
);
app.use("/health", healthRouter);
app.use("/auth", authRouter);
app.use("/files", fileRouter);


app.use(errorHandler);

export default app;