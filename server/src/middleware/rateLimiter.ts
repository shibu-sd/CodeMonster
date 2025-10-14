import { Request, Response, NextFunction } from "express";
import { Redis } from "ioredis";
import { RateLimitError } from "./errorHandler";
import { config } from "../config";
import { logger } from "../utils/logger";

export interface RateLimitOptions {
    windowMs: number;
    maxRequests: number;
    keyGenerator?: (req: Request) => string;
    skipSuccessfulRequests?: boolean;
    skipFailedRequests?: boolean;
    message?: string;
}

export interface IRateLimiter {
    middleware: (
        req: Request,
        res: Response,
        next: NextFunction
    ) => void | Promise<void>;
    options: RateLimitOptions;
}

export class RedisRateLimiter {
    private redis: Redis;
    private options: RateLimitOptions;

    constructor(redis: Redis, options: RateLimitOptions) {
        this.redis = redis;
        this.options = {
            message: "Too many requests, please try again later.",
            ...options,
        };
    }

    private async getRateLimitInfo(key: string): Promise<{
        count: number;
        resetTime: number;
        remaining: number;
    }> {
        const now = Date.now();
        const windowStart = now - this.options.windowMs;

        const pipeline = this.redis.pipeline();

        pipeline.zremrangebyscore(key, 0, windowStart);

        pipeline.zadd(key, now, `${now}-${Math.random()}`);

        pipeline.zcard(key);

        pipeline.ttl(key);

        const results = await pipeline.exec();

        if (!results) {
            throw new Error("Redis pipeline failed");
        }

        const count = (results[2][1] as number) || 0;
        const ttl = (results[3][1] as number) || this.options.windowMs / 1000;
        const resetTime = now + ttl * 1000;
        const remaining = Math.max(0, this.options.maxRequests - count);

        return {
            count,
            resetTime,
            remaining,
        };
    }

    private getKey(req: Request): string {
        if (this.options.keyGenerator) {
            return this.options.keyGenerator(req);
        }

        const userId = (req as any).user?.id;
        const ip = req.ip || req.connection.remoteAddress;
        const identifier = userId || ip || "anonymous";

        return `rate_limit:${identifier}`;
    }

    public middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        try {
            const key = this.getKey(req);
            const rateLimitInfo = await this.getRateLimitInfo(key);

            res.set({
                "X-RateLimit-Limit": this.options.maxRequests.toString(),
                "X-RateLimit-Remaining": rateLimitInfo.remaining.toString(),
                "X-RateLimit-Reset": new Date(
                    rateLimitInfo.resetTime
                ).toISOString(),
            });

            if (rateLimitInfo.count > this.options.maxRequests) {
                logger.logSecurity("Rate limit exceeded", {
                    key,
                    count: rateLimitInfo.count,
                    limit: this.options.maxRequests,
                    ip: req.ip,
                    userId: (req as any).user?.id,
                    url: req.originalUrl,
                });

                throw new RateLimitError(this.options.message!);
            }

            await this.redis.expire(
                key,
                Math.ceil(this.options.windowMs / 1000)
            );

            next();
        } catch (error) {
            next(error);
        }
    };
}

export class MemoryRateLimiter {
    private options: RateLimitOptions;
    private store: Map<string, { timestamps: number[]; resetTime: number }> =
        new Map();

    constructor(options: RateLimitOptions) {
        this.options = {
            message: "Too many requests, please try again later.",
            ...options,
        };

        setInterval(() => this.cleanup(), 60000); // Every minute
    }

    private cleanup(): void {
        const now = Date.now();
        for (const [key, data] of this.store.entries()) {
            if (now > data.resetTime) {
                this.store.delete(key);
            }
        }
    }

    private getKey(req: Request): string {
        if (this.options.keyGenerator) {
            return this.options.keyGenerator(req);
        }

        const userId = (req as any).user?.id;
        const ip = req.ip || req.connection.remoteAddress;
        const identifier = userId || ip || "anonymous";

        return `rate_limit:${identifier}`;
    }

    private getRateLimitInfo(key: string): {
        count: number;
        resetTime: number;
        remaining: number;
    } {
        const now = Date.now();
        const windowStart = now - this.options.windowMs;

        let data = this.store.get(key);

        if (!data || now > data.resetTime) {
            data = {
                timestamps: [],
                resetTime: now + this.options.windowMs,
            };
            this.store.set(key, data);
        }

        data.timestamps = data.timestamps.filter(
            (timestamp) => timestamp > windowStart
        );

        data.timestamps.push(now);

        const count = data.timestamps.length;
        const resetTime = data.resetTime;
        const remaining = Math.max(0, this.options.maxRequests - count);

        return {
            count,
            resetTime,
            remaining,
        };
    }

    public middleware = (
        req: Request,
        res: Response,
        next: NextFunction
    ): void => {
        try {
            const key = this.getKey(req);
            const rateLimitInfo = this.getRateLimitInfo(key);

            res.set({
                "X-RateLimit-Limit": this.options.maxRequests.toString(),
                "X-RateLimit-Remaining": rateLimitInfo.remaining.toString(),
                "X-RateLimit-Reset": new Date(
                    rateLimitInfo.resetTime
                ).toISOString(),
            });

            if (rateLimitInfo.count > this.options.maxRequests) {
                logger.logSecurity("Rate limit exceeded", {
                    key,
                    count: rateLimitInfo.count,
                    limit: this.options.maxRequests,
                    ip: req.ip,
                    userId: (req as any).user?.id,
                    url: req.originalUrl,
                });

                throw new RateLimitError(this.options.message!);
            }

            next();
        } catch (error) {
            next(error);
        }
    };
}

export const createRateLimiter = (
    redis: Redis | null,
    options: RateLimitOptions
): RedisRateLimiter | MemoryRateLimiter => {
    if (redis) {
        return new RedisRateLimiter(redis, options);
    } else {
        logger.warn("Using in-memory rate limiter (Redis not available)");
        return new MemoryRateLimiter(options);
    }
};

export const createGlobalRateLimiter = (redis: Redis | null) =>
    createRateLimiter(redis, {
        windowMs: config.rateLimit.globalWindowMs,
        maxRequests: config.rateLimit.maxGlobalRequestsPerWindow,
        keyGenerator: (req) => `global:${req.ip}`,
    });

export const createSubmissionRateLimiter = (redis: Redis | null) =>
    createRateLimiter(redis, {
        windowMs: config.rateLimit.submissionWindowMs,
        maxRequests: config.rateLimit.maxSubmissionsPerWindow,
        keyGenerator: (req) => {
            const userId = (req as any).user?.id;
            return `submission:${userId || req.ip}`;
        },
        message: "Too many submissions. Please wait before trying again.",
    });

export const createRunCodeRateLimiter = (redis: Redis | null) =>
    createRateLimiter(redis, {
        windowMs: config.rateLimit.runCodeWindowMs,
        maxRequests: config.rateLimit.maxRunCodePerWindow,
        keyGenerator: (req) => {
            const userId = (req as any).user?.id;
            return `runcode:${userId || req.ip}`;
        },
        message: "Too many run requests. Please wait before trying again.",
    });

export const createAuthRateLimiter = (redis: Redis | null) =>
    createRateLimiter(redis, {
        windowMs: 15 * 60 * 1000, // 15 minutes
        maxRequests: 10, // 10 auth attempts per 15 minutes
        keyGenerator: (req) => `auth:${req.ip}`,
        message: "Too many authentication attempts. Please try again later.",
    });

export const createAdminRateLimiter = (redis: Redis | null) =>
    createRateLimiter(redis, {
        windowMs: 60 * 1000, // 1 minute
        maxRequests: 30, // 30 admin requests per minute
        keyGenerator: (req) => {
            const userId = (req as any).user?.id;
            return `admin:${userId}`;
        },
        message: "Too many admin requests. Please slow down.",
    });

export class AdaptiveRateLimiter {
    private baseLimiter: RedisRateLimiter | MemoryRateLimiter;
    private loadFactor: number = 1.0;
    private originalMaxRequests: number;

    constructor(baseLimiter: RedisRateLimiter | MemoryRateLimiter) {
        this.baseLimiter = baseLimiter;
        this.originalMaxRequests = this.getMaxRequests(baseLimiter);
    }

    private getMaxRequests(
        limiter: RedisRateLimiter | MemoryRateLimiter
    ): number {
        if (limiter instanceof RedisRateLimiter) {
            return (limiter as any).options.maxRequests;
        } else if (limiter instanceof MemoryRateLimiter) {
            return (limiter as any).options.maxRequests;
        }
        throw new Error("Invalid rate limiter type");
    }

    private setMaxRequests(
        limiter: RedisRateLimiter | MemoryRateLimiter,
        value: number
    ): void {
        if (limiter instanceof RedisRateLimiter) {
            (limiter as any).options.maxRequests = value;
        } else if (limiter instanceof MemoryRateLimiter) {
            (limiter as any).options.maxRequests = value;
        } else {
            throw new Error("Invalid rate limiter type");
        }
    }

    public setLoadFactor(factor: number): void {
        this.loadFactor = Math.max(0.1, Math.min(2.0, factor));
    }

    public middleware = async (
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> => {
        const adjustedMax = Math.floor(
            this.originalMaxRequests / this.loadFactor
        );

        try {
            this.setMaxRequests(this.baseLimiter, adjustedMax);
            await this.baseLimiter.middleware(req, res, next);
        } finally {
            this.setMaxRequests(this.baseLimiter, this.originalMaxRequests);
        }
    };
}

export const rateLimitMiddleware = {
    global: (redis: Redis | null) => createGlobalRateLimiter(redis).middleware,
    submission: (redis: Redis | null) =>
        createSubmissionRateLimiter(redis).middleware,
    runCode: (redis: Redis | null) =>
        createRunCodeRateLimiter(redis).middleware,
    auth: (redis: Redis | null) => createAuthRateLimiter(redis).middleware,
    admin: (redis: Redis | null) => createAdminRateLimiter(redis).middleware,
    custom: (redis: Redis | null, options: RateLimitOptions) =>
        createRateLimiter(redis, options).middleware,
};
