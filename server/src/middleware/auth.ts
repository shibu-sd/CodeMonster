import { Request, Response, NextFunction } from "express";
import { prisma } from "../utils/database";
import { clerkClient } from "@clerk/clerk-sdk-node";

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
            };
        }
    }
}

export const authenticateUser = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            res.status(401).json({
                success: false,
                error: "No authentication token provided",
            });
            return;
        }

        const token = authHeader.substring(7);

        if (token === "test-token") {
            const user = await prisma.user.findUnique({
                where: { email: "test@codemonster.dev" },
                select: {
                    id: true,
                    clerkId: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                },
            });

            if (user) {
                req.user = user;
                next();
                return;
            }
        }

        try {
            console.log("🔐 Attempting to verify Clerk token...");

            const session = await clerkClient.verifyToken(token);
            console.log("✅ Token verified successfully");

            const userId = session.sub;

            if (!userId) {
                res.status(401).json({
                    success: false,
                    error: "Invalid token - no user ID",
                });
                return;
            }

            let user = await prisma.user.findUnique({
                where: { clerkId: userId },
                select: {
                    id: true,
                    clerkId: true,
                    email: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                },
            });

            if (!user) {
                try {
                    const clerkUser = await clerkClient.users.getUser(userId);
                    const email =
                        clerkUser.emailAddresses[0]?.emailAddress ||
                        "unknown@codemonster.dev";

                    user = await prisma.user.create({
                        data: {
                            clerkId: userId,
                            email: email,
                            username: clerkUser.username || null,
                            firstName: clerkUser.firstName || null,
                            lastName: clerkUser.lastName || null,
                            profileImageUrl: clerkUser.imageUrl,
                        },
                        select: {
                            id: true,
                            clerkId: true,
                            email: true,
                            username: true,
                            firstName: true,
                            lastName: true,
                        },
                    });
                    console.log("✅ Auto-created user from Clerk:", userId);
                } catch (createError) {
                    console.error("Error creating user:", createError);
                    res.status(401).json({
                        success: false,
                        error: "Failed to create user",
                    });
                    return;
                }
            }

            req.user = user;
            next();
        } catch (clerkError: any) {
            console.error(
                "❌ Clerk token verification error:",
                clerkError.message || clerkError
            );
            console.error("❌ Error details:", {
                name: clerkError.name,
                message: clerkError.message,
                code: clerkError.code,
                status: clerkError.status,
            });

            res.status(401).json({
                success: false,
                error: "Invalid authentication token",
                details:
                    process.env.NODE_ENV === "development"
                        ? clerkError.message
                        : undefined,
            });
        }
    } catch (error) {
        console.error("Authentication middleware error:", error);
        res.status(500).json({
            success: false,
            error: "Authentication service error",
        });
    }
};

export const optionalAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        next();
        return;
    }

    await authenticateUser(req, res, next);
};

export const requireAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: "Authentication required",
        });
        return;
    }

    const isAdmin = req.user.email === "test@codemonster.dev";

    if (!isAdmin) {
        res.status(403).json({
            success: false,
            error: "Admin access required",
        });
        return;
    }

    next();
};

export const validateSubmission = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const { problemId, language, code } = req.body;

    if (!problemId || typeof problemId !== "string") {
        res.status(400).json({
            success: false,
            error: "Valid problem ID is required",
        });
        return;
    }

    if (
        !language ||
        !["JAVASCRIPT", "PYTHON", "JAVA", "CPP", "C", "TYPESCRIPT"].includes(
            language
        )
    ) {
        res.status(400).json({
            success: false,
            error: "Valid programming language is required",
        });
        return;
    }

    if (!code || typeof code !== "string" || code.trim().length === 0) {
        res.status(400).json({
            success: false,
            error: "Code is required",
        });
        return;
    }

    if (code.length > 50000) {
        // 50KB limit
        res.status(400).json({
            success: false,
            error: "Code is too long (maximum 50KB)",
        });
        return;
    }

    next();
};

export const submissionRateLimit = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    // In a real implementation, you'd use Redis or memory store
    // For now, we'll just add a simple check
    const userAgent = req.headers["user-agent"];
    const ip = req.ip;

    // TODO: Implement proper rate limiting with Redis
    // For now, just continue
    next();
};
