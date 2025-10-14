import { Request, Response, NextFunction } from "express";
import { clerkClient } from "@clerk/clerk-sdk-node";
import {
    AuthenticationError,
    AuthorizationError,
    asyncHandler,
} from "./errorHandler";
import { config } from "../config";
import { logger } from "../utils/logger";
import { userRepository } from "../repositories";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                clerkId: string;
                email: string;
                username?: string | null;
                firstName?: string | null;
                lastName?: string | null;
                profileImageUrl?: string | null;
            };
        }
    }
}

export const authenticateUser = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AuthenticationError("No authentication token provided");
        }

        const token = authHeader.substring(7);

        if (token === config.auth.testToken) {
            const user = await userRepository.findByEmail(
                config.auth.testEmail
            );
            if (user) {
                req.user = user;
                logger.debug("Test user authenticated", { userId: user.id });
                return next();
            }
        }

        try {
            logger.debug("Attempting to verify Clerk token", {
                tokenLength: token.length,
            });

            const session = await clerkClient.verifyToken(token);
            logger.debug("Token verified successfully");

            const userId = session.sub;

            if (!userId) {
                throw new AuthenticationError("Invalid token - no user ID");
            }

            let user = await userRepository.findByClerkId(userId);

            if (!user) {
                logger.info("Auto-creating user from Clerk", {
                    clerkId: userId,
                });

                try {
                    const clerkUser = await clerkClient.users.getUser(userId);
                    const email =
                        clerkUser.emailAddresses[0]?.emailAddress ||
                        "unknown@codemonster.dev";

                    user = await userRepository.createUserFromClerk({
                        id: userId,
                        email,
                        username: clerkUser.username,
                        firstName: clerkUser.firstName,
                        lastName: clerkUser.lastName,
                        profileImageUrl: clerkUser.imageUrl,
                    });

                    logger.info("User created successfully", {
                        clerkId: userId,
                        email,
                        userId: user.id,
                    });
                } catch (createError) {
                    logger.error("Error creating user from Clerk", {
                        clerkId: userId,
                        error: createError,
                    });
                    throw new AuthenticationError("Failed to create user");
                }
            }

            req.user = user;
            logger.debug("User authenticated", {
                userId: user.id,
                clerkId: user.clerkId,
            });
            next();
        } catch (clerkError: any) {
            logger.error("Clerk token verification error", {
                error: clerkError.message || clerkError,
                details: {
                    name: clerkError.name,
                    message: clerkError.message,
                    code: clerkError.code,
                    status: clerkError.status,
                },
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });

            throw new AuthenticationError("Invalid authentication token");
        }
    }
);

export const optionalAuth = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return next();
        }

        try {
            await authenticateUser(req, _res, next);
        } catch (error: any) {
            logger.debug("Optional authentication failed", {
                error: error.message,
            });
            next();
        }
    }
);

export const requireAdmin = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        if (!req.user) {
            throw new AuthenticationError("Authentication required");
        }

        const isAdmin = req.user.email === config.auth.testEmail;

        if (!isAdmin) {
            logger.logSecurity("Unauthorized admin access attempt", {
                userId: req.user.id,
                email: req.user.email,
                ip: req.ip,
                userAgent: req.get("User-Agent"),
            });
            throw new AuthorizationError("Admin access required");
        }

        logger.debug("Admin access granted", { userId: req.user.id });
        next();
    }
);

export const validateSubmission = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    const { problemId, language, code } = req.body;

    if (!problemId || typeof problemId !== "string") {
        throw new AuthenticationError("Valid problem ID is required");
    }

    const validLanguages = [
        "JAVASCRIPT",
        "PYTHON",
        "JAVA",
        "CPP",
        "C",
        "TYPESCRIPT",
    ];
    if (!language || !validLanguages.includes(language)) {
        throw new AuthenticationError("Valid programming language is required");
    }

    if (!code || typeof code !== "string" || code.trim().length === 0) {
        throw new AuthenticationError("Code is required");
    }

    if (code.length > config.upload.maxCodeLength) {
        throw new AuthenticationError(
            `Code is too long (maximum ${config.upload.maxCodeLength / 1000}KB)`
        );
    }

    next();
};
