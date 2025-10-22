import { Request, Response, NextFunction } from "express";
import { config } from "../config";
import { ApiResponse } from "../types";

export enum ErrorCode {
    VALIDATION_ERROR = "VALIDATION_ERROR",
    AUTHENTICATION_ERROR = "AUTHENTICATION_ERROR",
    AUTHORIZATION_ERROR = "AUTHORIZATION_ERROR",
    NOT_FOUND = "NOT_FOUND",
    CONFLICT = "CONFLICT",
    RATE_LIMIT_EXCEEDED = "RATE_LIMIT_EXCEEDED",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
    DATABASE_ERROR = "DATABASE_ERROR",
    EXTERNAL_SERVICE_ERROR = "EXTERNAL_SERVICE_ERROR",
    QUEUE_ERROR = "QUEUE_ERROR",
}

export class AppError extends Error {
    public readonly statusCode: number;
    public readonly code: ErrorCode;
    public readonly isOperational: boolean;

    constructor(
        message: string,
        statusCode: number = 500,
        code: ErrorCode = ErrorCode.INTERNAL_SERVER_ERROR,
        isOperational: boolean = true
    ) {
        super(message);
        this.statusCode = statusCode;
        this.code = code;
        this.isOperational = isOperational;

        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, AppError);
        }
    }
}

export class ValidationError extends AppError {
    constructor(message: string) {
        super(message, 400, ErrorCode.VALIDATION_ERROR);
    }
}

export class AuthenticationError extends AppError {
    constructor(message: string = "Authentication required") {
        super(message, 401, ErrorCode.AUTHENTICATION_ERROR);
    }
}

export class AuthorizationError extends AppError {
    constructor(message: string = "Access denied") {
        super(message, 403, ErrorCode.AUTHORIZATION_ERROR);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Resource not found") {
        super(message, 404, ErrorCode.NOT_FOUND);
    }
}

export class ConflictError extends AppError {
    constructor(message: string) {
        super(message, 409, ErrorCode.CONFLICT);
    }
}

export class RateLimitError extends AppError {
    constructor(message: string = "Rate limit exceeded") {
        super(message, 429, ErrorCode.RATE_LIMIT_EXCEEDED);
    }
}

export class DatabaseError extends AppError {
    constructor(message: string = "Database operation failed") {
        super(message, 500, ErrorCode.DATABASE_ERROR);
    }
}

export class ExternalServiceError extends AppError {
    constructor(message: string = "External service error") {
        super(message, 502, ErrorCode.EXTERNAL_SERVICE_ERROR);
    }
}

export class QueueError extends AppError {
    constructor(message: string = "Queue operation failed") {
        super(message, 500, ErrorCode.QUEUE_ERROR);
    }
}

// Error handler middleware
export const errorHandler = (
    err: Error | AppError,
    req: Request,
    res: Response,
    _next: NextFunction
): void => {
    let error = err as AppError;

    if (!(error instanceof AppError)) {
        const statusCode = (err as any).statusCode || 500;
        const message = err.message || "Internal server error";
        error = new AppError(
            message,
            statusCode,
            ErrorCode.INTERNAL_SERVER_ERROR
        );
    }

    logError(error, req);

    const errorResponse: ApiResponse = {
        success: false,
        error: error.message,
    };

    if (config.server.nodeEnv === "development") {
        (errorResponse as any).code = error.code;
        (errorResponse as any).stack = error.stack;
        (errorResponse as any).timestamp = new Date().toISOString();
        (errorResponse as any).path = req.originalUrl;
        (errorResponse as any).method = req.method;
    }

    res.status(error.statusCode).json(errorResponse);
};

const logError = (error: AppError, req: Request): void => {
    const logData = {
        error: {
            name: error.name,
            message: error.message,
            code: error.code,
            stack: error.stack,
        },
        request: {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            userId: (req as any).user?.id,
        },
        timestamp: new Date().toISOString(),
    };

    if (config.server.nodeEnv === "development") {
        console.error("Error Details:", JSON.stringify(logData, null, 2));
    } else {
        console.error(`[${error.code}] ${error.message}`, {
            method: req.method,
            url: req.originalUrl,
            userId: (req as any).user?.id,
        });
    }
};

export const asyncHandler = (fn: Function) => {
    return (req: Request, res: Response, next: NextFunction) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };
};

export const notFoundHandler = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const error = new NotFoundError(`Route ${req.originalUrl} not found`);
    next(error);
};
