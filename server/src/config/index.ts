import * as dotenv from "dotenv";

dotenv.config();

export const config = {
    // Server Configuration
    server: {
        port: parseInt(process.env.PORT || "5000"),
        nodeEnv: process.env.NODE_ENV || "development",
        apiPrefix: "/api",
    },

    // Database Configuration
    database: {
        url: process.env.DATABASE_URL || "",
        logLevel:
            process.env.NODE_ENV === "development"
                ? ["query", "info", "warn", "error"]
                : ["error"],
    },

    // Redis Configuration
    redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: parseInt(process.env.REDIS_PORT || "6379"),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
        retryDelayOnFailover: 100,
        enableReadyCheck: false,
        lazyConnect: true,
    },

    // Judge Service Configuration
    judge: {
        url: process.env.JUDGE_URL || "http://localhost:3001",
        timeout: 30000, // 30 seconds - hardcoded
    },

    // Authentication Configuration
    auth: {
        clerkSecretKey: process.env.CLERK_SECRET_KEY || "",
        testToken: process.env.TEST_TOKEN || "test-token",
        testEmail: process.env.TEST_EMAIL || "test@codemonster.dev",
    },

    // CORS Configuration
    cors: {
        origin:
            process.env.NODE_ENV === "production"
                ? ["https://your-domain.com"] // Update this in production
                : ["http://localhost:3000"],
        credentials: true,
    },

    // Rate Limiting Configuration
    rateLimit: {
        submissionWindowMs: 60 * 1000, // 1 minute
        maxSubmissionsPerWindow: 30, // Increased for development
        runCodeWindowMs: 60 * 1000, // 1 minute
        maxRunCodePerWindow: 60, // Increased for development
        globalWindowMs: 15 * 60 * 1000, // 15 minutes
        maxGlobalRequestsPerWindow: 1000, // Increased for development
    },

    // File Upload Configuration
    upload: {
        maxCodeLength: 50000, // 50KB
        maxInputLength: 10000, // 10KB
    },

    // Queue Configuration
    queue: {
        removeOnComplete: 50,
        removeOnFail: 20,
        attempts: 2,
        backoffDelay: 2000,
    },

    // Cleanup Configuration
    cleanup: {
        maxSubmissionsPerUser: 15,
        cleanupInterval: 24 * 60 * 60 * 1000, // 24 hours
    },

    // Logging Configuration
    logging: {
        level: "info", // Hardcoded for development
        format: process.env.NODE_ENV === "production" ? "json" : "dev",
    },

    // Pagination Configuration
    pagination: {
        defaultLimit: 20,
        maxLimit: 100,
    },

    // Cache Configuration
    cache: {
        ttl: 5 * 60 * 1000, // 5 minutes
        maxSize: 1000,
    },

    // Battle Configuration
    battle: {
        enabled: process.env.FEATURE_BATTLES === "true",
        timeLimit: parseInt(process.env.BATTLE_TIME_LIMIT || "1800"), // 30 minutes
        queueTimeout: parseInt(process.env.BATTLE_QUEUE_TIMEOUT || "300"), // 5 minutes
    },
};

// Validation helper
export const validateConfig = (): void => {
    const requiredVars = ["DATABASE_URL"];

    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
        throw new Error(
            `Missing required environment variables: ${missingVars.join(", ")}`
        );
    }

    // Warn about optional but recommended vars in production
    if (config.server.nodeEnv === "production") {
        const recommendedVars = ["CLERK_SECRET_KEY", "REDIS_HOST", "JUDGE_URL"];

        const missingRecommended = recommendedVars.filter(
            (varName) => !process.env[varName]
        );

        if (missingRecommended.length > 0) {
            console.warn(
                `Warning: Recommended environment variables not set in production: ${missingRecommended.join(
                    ", "
                )}`
            );
        }
    }
};

export default config;
