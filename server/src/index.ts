import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { config, validateConfig } from "./config";
import { connectDatabase } from "./utils/database";
import { apiRoutes } from "./routes";
import { errorHandler, notFoundHandler } from "./middleware/errorHandler";
import { sanitizeInput } from "./middleware/validation";
import { rateLimitMiddleware } from "./middleware/rateLimiter";
import { requestLogger, logger } from "./utils/logger";
import { redisConnection } from "./queues/submissionQueue";

// Validate configuration
validateConfig();

const app = express();
const PORT = config.server.port;

// Middlewares
app.use(helmet());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors(config.cors));

app.use(requestLogger());

app.use(sanitizeInput);

// Global rate limiting
app.use("/api", rateLimitMiddleware.global(redisConnection));

app.get("/health", (_req, res) => {
    res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        environment: config.server.nodeEnv,
        version: "1.0.0",
        uptime: process.uptime(),
    });
});

app.use(config.server.apiPrefix, apiRoutes);

app.use(notFoundHandler);

app.use(errorHandler);

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
    logger.info(`Received ${signal}, shutting down gracefully...`);

    server.close(() => {
        logger.info("HTTP server closed");

        const prisma = require("./utils/database").prisma;
        if (prisma) {
            prisma
                .$disconnect()
                .then(() => {
                    logger.info("Database connection closed");

                    redisConnection.disconnect();
                    logger.info("Redis connection closed");

                    process.exit(0);
                })
                .catch((error: Error) => {
                    logger.error("Error during shutdown:", error);
                    process.exit(1);
                });
        } else {
            process.exit(0);
        }
    });

    setTimeout(() => {
        logger.error(
            "Could not close connections in time, forcefully shutting down"
        );
        process.exit(1);
    }, 30000);
};

// Start server
const server = app.listen(PORT, async () => {
    logger.info(`🚀 Server running on port ${PORT}`, {
        port: PORT,
        environment: config.server.nodeEnv,
        healthCheck: `http://localhost:${PORT}/health`,
        apiPrefix: config.server.apiPrefix,
    });

    try {
        await connectDatabase();
        logger.info("✅ Database connected successfully");
    } catch (error) {
        logger.error("❌ Database connection failed:", error);
        process.exit(1);
    }
});

process.on("uncaughtException", (error) => {
    logger.error("Uncaught Exception:", error);
    process.exit(1);
});

process.on("unhandledRejection", (reason, promise) => {
    logger.error("Unhandled Rejection at:", { promise, reason });
    process.exit(1);
});

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

export default app;
