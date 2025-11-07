import { Server as SocketIOServer } from "socket.io";
import { Server as HTTPServer } from "http";
import { redisConnection } from "../queues/submissionQueue";
import { logger } from "../utils/logger";
import { config } from "../config";
import { BattleService } from "../services/battleService";
import { Clerk } from "@clerk/clerk-sdk-node";
import { prisma } from "../utils/database";

// Redis adapter - will be conditionally imported
let createAdapter: any = null;
try {
    createAdapter = require("@socket.io/redis-adapter").createAdapter;
} catch (error) {
    logger.warn(
        "Redis adapter not available - Socket.io will run without scaling"
    );
}

export interface BattleSocketUser {
    id: string;
    username?: string;
    profileImageUrl?: string;
    battleId?: string;
}

export interface BattleEvents {
    // Client to Server
    "join-battle-queue": () => void;
    "leave-battle-queue": () => void;
    "join-battle": (battleId: string) => void;
    "battle-run": (data: {
        battleId: string;
        code: string;
        language: string;
    }) => void;
    "battle-submit": (data: {
        battleId: string;
        code: string;
        language: string;
    }) => void;
    "battle-message": (data: { battleId: string; message: string }) => void;
    "battle-forfeit": (battleId: string) => void;
    disconnect: () => void;

    // Server to Client
    "battle-matched": (data: {
        battleId: string;
        opponent: BattleSocketUser;
        problem: any;
    }) => void;
    "battle-start": (data: { battleId: string; timeLimit: number }) => void;
    "battle-run-result": (data: { userId: string; result: any }) => void;
    "battle-submit-result": (data: { userId: string; result: any }) => void;
    "battle-finish": (data: { winnerId?: string; reason: string }) => void;
    "battle-opponent-disconnected": (data: { userId: string }) => void;
    "battle-opponent-reconnected": (data: { userId: string }) => void;
    "battle-message-received": (data: {
        userId: string;
        message: string;
        timestamp: number;
    }) => void;
    "battle-error": (data: { message: string }) => void;
    "queue-status": (data: { usersInQueue: number }) => void;
}

const clerk = Clerk({ apiKey: config.auth.clerkSecretKey });

export class BattleSocket {
    private io: SocketIOServer<BattleEvents>;
    private connectedUsers: Map<string, BattleSocketUser> = new Map();
    private messageCooldowns: Map<string, number> = new Map();
    private MESSAGE_COOLDOWN = 60000; // 60 seconds
    private disconnectionTimers: Map<string, NodeJS.Timeout> = new Map(); // userId -> timer
    private RECONNECTION_GRACE_PERIOD = 10000; // 10 seconds to reconnect

    constructor(httpServer: HTTPServer) {
        // Create Redis adapter
        const pubClient = redisConnection;
        const subClient = pubClient.duplicate();

        const socketConfig: any = {
            cors: {
                origin: config.cors.origin,
                credentials: true,
                methods: ["GET", "POST"],
            },
            transports: ["websocket", "polling"],
        };

        if (createAdapter && pubClient && subClient) {
            socketConfig.adapter = createAdapter(pubClient, subClient);
        }

        this.io = new SocketIOServer(httpServer, socketConfig);

        this.setupMiddleware();
        this.setupEventHandlers();
        this.startQueueStatusBroadcast();

        logger.info("Battle socket server initialized");
    }

    private setupMiddleware() {
        this.io.use(async (socket, next) => {
            try {
                const token = socket.handshake.auth.token;
                if (!token) {
                    return next(new Error("Authentication token required"));
                }

                const verifiedToken = await clerk.verifyToken(token);
                if (!verifiedToken || !verifiedToken.sub) {
                    return next(new Error("Invalid authentication token"));
                }

                const dbUser = await prisma.user.findUnique({
                    where: { clerkId: verifiedToken.sub },
                });

                if (!dbUser) {
                    return next(new Error("User not found in database"));
                }

                const user: BattleSocketUser = {
                    id: dbUser.id,
                    username:
                        dbUser.username || dbUser.firstName || "Anonymous",
                    profileImageUrl: dbUser.profileImageUrl || undefined,
                };

                socket.data.user = user;
                next();
            } catch (error) {
                logger.error("Socket authentication error:", error);
                next(new Error("Authentication failed"));
            }
        });
    }

    private setupEventHandlers() {
        this.io.on("connection", (socket) => {
            const user = socket.data.user as BattleSocketUser;
            this.connectedUsers.set(socket.id, user);

            logger.info(
                `🔌 User ${user.username || "Unknown"} (ID: ${
                    user.id
                }) connected to battle socket: ${socket.id}`
            );

            socket.on("join-battle-queue", async () => {
                await this.handleJoinQueue(socket);
            });

            socket.on("leave-battle-queue", async () => {
                await this.handleLeaveQueue(socket);
            });

            socket.on("join-battle", async (battleId) => {
                await this.handleJoinBattle(socket, battleId);
            });

            socket.on("battle-run", async (data) => {
                await this.handleBattleRun(socket, data);
            });

            socket.on("battle-submit", async (data) => {
                await this.handleBattleSubmit(socket, data);
            });

            socket.on("battle-message", async (data) => {
                await this.handleBattleMessage(socket, data);
            });

            socket.on("battle-forfeit", async (battleId) => {
                await this.handleBattleForfeit(socket, battleId);
            });

            socket.on("disconnect", () => {
                this.handleDisconnection(socket);
            });
        });
    }

    private async handleJoinQueue(socket: any) {
        try {
            const user = socket.data.user as BattleSocketUser;

            await BattleService.removeFromQueue(user.id);

            await BattleService.addToQueue(
                {
                    userId: user.id,
                    username: user.username || "Anonymous",
                    profileImageUrl: user.profileImageUrl,
                    addedAt: Date.now(),
                },
                this
            );

            socket.emit("queue-status", {
                usersInQueue: (await BattleService.getQueueStatus()).length,
            });
            this.broadcastQueueStatus();

            logger.info(
                `User ${user.username || "Unknown"} joined battle queue`
            );
        } catch (error) {
            logger.error("Failed to join battle queue:", error);
            socket.emit("battle-error", {
                message: "Failed to join battle queue",
            });
        }
    }

    private async handleLeaveQueue(socket: any) {
        try {
            const user = socket.data.user as BattleSocketUser;
            await BattleService.removeFromQueue(user.id);

            socket.emit("queue-status", {
                usersInQueue: (await BattleService.getQueueStatus()).length,
            });
            this.broadcastQueueStatus();

            logger.info(`User ${user.username || "Unknown"} left battle queue`);
        } catch (error) {
            logger.error("Failed to leave battle queue:", error);
            socket.emit("battle-error", {
                message: "Failed to leave battle queue",
            });
        }
    }

    private async handleJoinBattle(socket: any, battleId: string) {
        try {
            const user = socket.data.user as BattleSocketUser;

            if (this.disconnectionTimers.has(user.id)) {
                clearTimeout(this.disconnectionTimers.get(user.id)!);
                this.disconnectionTimers.delete(user.id);
                logger.info(
                    `✅ User ${
                        user.username || "Unknown"
                    } reconnected to battle ${battleId}, cancelled disconnection timer`
                );

                socket.to(battleId).emit("battle-opponent-reconnected", {
                    userId: user.id,
                });
            }

            if (user.battleId === battleId) {
                logger.info(
                    `User ${
                        user.username || "Unknown"
                    } already in battle room ${battleId}, skipping`
                );
                return;
            }

            const battle = await BattleService.getBattle(battleId);
            if (!battle) {
                socket.emit("battle-error", { message: "Battle not found" });
                return;
            }

            socket.join(battleId);
            user.battleId = battleId;

            this.connectedUsers.set(socket.id, user);

            const opponent = battle.participants.find(
                (p) => p.userId !== user.id
            );

            const socketsInRoom = await this.io.in(battleId).fetchSockets();
            logger.info(
                `✅ User ${user.username || "Unknown"} (${
                    socket.id
                }) joined battle room ${battleId}. Room now has ${
                    socketsInRoom.length
                } socket(s): ${socketsInRoom.map((s: any) => s.id).join(", ")}`
            );
        } catch (error) {
            logger.error("Failed to join battle:", error);
            socket.emit("battle-error", { message: "Failed to join battle" });
        }
    }

    private async handleBattleRun(
        socket: any,
        data: { battleId: string; code: string; language: string }
    ) {
        try {
            const user = socket.data.user as BattleSocketUser;

            logger.info(
                `🚀 STEP 2 (Backend): Received battle-run event from ${
                    user.username || "Unknown"
                } (${socket.id}) in battle ${data.battleId}`
            );

            const socketsInRoom = await this.io
                .in(data.battleId)
                .fetchSockets();
            logger.info(
                `🔍 Sockets in room ${data.battleId}: ${
                    socketsInRoom.length
                } sockets - ${socketsInRoom.map((s: any) => s.id).join(", ")}`
            );

            let emittedCount = 0;
            for (const roomSocket of socketsInRoom) {
                if (roomSocket.id !== socket.id) {
                    logger.info(
                        `📡 STEP 2.5: Emitting battle-run-result to socket ${roomSocket.id}`
                    );
                    roomSocket.emit("battle-run-result", {
                        userId: user.id,
                        result: { status: "RUNNING" },
                    });
                    emittedCount++;
                } else {
                    logger.info(`⏭️ Skipping sender socket ${roomSocket.id}`);
                }
            }

            logger.info(
                `✅ STEP 2 Complete: Emitted battle-run-result to ${emittedCount} opponent socket(s)`
            );
        } catch (error) {
            logger.error("Failed to handle battle run:", error);
            socket.emit("battle-error", { message: "Failed to run code" });
        }
    }

    private async handleBattleSubmit(
        socket: any,
        data: { battleId: string; code: string; language: string }
    ) {
        try {
            const user = socket.data.user as BattleSocketUser;

            logger.info(
                `📤 STEP 2 (Backend): Received battle-submit event from ${
                    user.username || "Unknown"
                } (${socket.id}) in battle ${data.battleId}`
            );

            const socketsInRoom = await this.io
                .in(data.battleId)
                .fetchSockets();
            logger.info(
                `🔍 Sockets in room ${data.battleId}: ${
                    socketsInRoom.length
                } sockets - ${socketsInRoom.map((s: any) => s.id).join(", ")}`
            );

            let emittedCount = 0;
            for (const roomSocket of socketsInRoom) {
                if (roomSocket.id !== socket.id) {
                    logger.info(
                        `📡 STEP 2.5: Emitting battle-submit-result to socket ${roomSocket.id}`
                    );
                    roomSocket.emit("battle-submit-result", {
                        userId: user.id,
                        result: { status: "PENDING" },
                    });
                    emittedCount++;
                } else {
                    logger.info(`⏭️ Skipping sender socket ${roomSocket.id}`);
                }
            }

            logger.info(
                `✅ STEP 2 Complete: Emitted battle-submit-result to ${emittedCount} opponent socket(s)`
            );
        } catch (error) {
            logger.error("Failed to handle battle submit:", error);
            socket.emit("battle-error", { message: "Failed to submit code" });
        }
    }

    private async handleBattleMessage(
        socket: any,
        data: { battleId: string; message: string }
    ) {
        try {
            const user = socket.data.user as BattleSocketUser;
            const cooldownKey = `${user.id}:${data.battleId}`;

            const lastMessage = this.messageCooldowns.get(cooldownKey);
            if (
                lastMessage &&
                Date.now() - lastMessage < this.MESSAGE_COOLDOWN
            ) {
                const timeLeft = Math.ceil(
                    (this.MESSAGE_COOLDOWN - (Date.now() - lastMessage)) / 1000
                );
                socket.emit("battle-error", {
                    message: `Please wait ${timeLeft} seconds before sending another message`,
                });
                return;
            }

            if (!data.message || data.message.length > 100) {
                socket.emit("battle-error", {
                    message: "Message must be between 1 and 100 characters",
                });
                return;
            }

            this.messageCooldowns.set(cooldownKey, Date.now());

            socket.to(data.battleId).emit("battle-message-received", {
                userId: user.id,
                message: data.message,
                timestamp: Date.now(),
            });

            logger.info(
                `User ${user.username || "Unknown"} sent message in battle ${
                    data.battleId
                }: ${data.message}`
            );
        } catch (error) {
            logger.error("Failed to handle battle message:", error);
            socket.emit("battle-error", { message: "Failed to send message" });
        }
    }

    private async handleBattleForfeit(socket: any, battleId: string) {
        try {
            const user = socket.data.user as BattleSocketUser;

            logger.info(
                `User ${
                    user.username || "Unknown"
                } forfeited battle ${battleId}`
            );

            const battle = await BattleService.getBattle(battleId);
            if (!battle) {
                socket.emit("battle-error", { message: "Battle not found" });
                return;
            }

            const opponent = battle.participants.find(
                (p) => p.userId !== user.id
            );

            if (!opponent) {
                logger.warn(`No opponent found in battle ${battleId}`);
            }

            await BattleService.finishBattle(battleId, opponent?.userId);

            this.broadcastBattleFinish(battleId, opponent?.userId, "forfeit");

            logger.info(
                `Battle ${battleId} ended due to forfeit by ${
                    user.username || "Unknown"
                }. Winner: ${opponent?.userId || "none"}`
            );
        } catch (error) {
            logger.error("Failed to handle battle forfeit:", error);
            socket.emit("battle-error", {
                message: "Failed to forfeit battle",
            });
        }
    }

    private handleDisconnection(socket: any) {
        const user = socket.data.user as BattleSocketUser;
        this.connectedUsers.delete(socket.id);

        BattleService.removeFromQueue(user.id).catch(console.error);

        if (user.battleId) {
            logger.info(
                `User ${user.username || "Unknown"} disconnected from battle ${
                    user.battleId
                }. Starting ${this.RECONNECTION_GRACE_PERIOD}ms grace period...`
            );

            const timer = setTimeout(() => {
                logger.info(
                    `Grace period expired for user ${
                        user.username || "Unknown"
                    }. Processing disconnection...`
                );

                this.disconnectionTimers.delete(user.id);

                BattleService.handleDisconnection(
                    user.battleId!,
                    user.id
                ).catch(console.error);

                this.io
                    .to(user.battleId!)
                    .emit("battle-opponent-disconnected", {
                        userId: user.id,
                    });

                logger.info(
                    `User ${
                        user.username || "Unknown"
                    } failed to reconnect. Battle ${user.battleId} notified.`
                );
            }, this.RECONNECTION_GRACE_PERIOD);

            this.disconnectionTimers.set(user.id, timer);
        }

        this.broadcastQueueStatus();

        logger.info(
            `User ${user.username || "Unknown"} disconnected from battle socket`
        );
    }

    private startQueueStatusBroadcast() {
        setInterval(async () => {
            const queueLength = (await BattleService.getQueueStatus()).length;
            this.io.emit("queue-status", { usersInQueue: queueLength });
        }, 5000); // Update every 5 seconds
    }

    private broadcastQueueStatus() {
        BattleService.getQueueStatus()
            .then((queue) => {
                this.io.emit("queue-status", { usersInQueue: queue.length });
            })
            .catch(console.error);
    }

    public broadcastBattleStart(battleId: string, timeLimit: number) {
        logger.info(
            `Broadcasting battle-start event for battle ${battleId} with timeLimit ${timeLimit}`
        );

        this.io.to(battleId).emit("battle-start", { battleId, timeLimit });
    }

    public broadcastBattleFinish(
        battleId: string,
        winnerId?: string,
        reason = "completed"
    ) {
        this.io.to(battleId).emit("battle-finish", { winnerId, reason });
    }

    public async broadcastSubmissionResult(
        battleId: string,
        userId: string,
        result: any,
        isRun: boolean = false
    ) {
        const eventName = isRun ? "battle-run-result" : "battle-submit-result";

        const senderSocketId = this.findSocketIdByUserId(userId);

        if (!senderSocketId) {
            logger.warn(
                `Could not find socket for user ${userId}, broadcasting to all in room`
            );
            this.io.to(battleId).emit(eventName, { userId, result });
            return;
        }

        const socketsInRoom = await this.io.in(battleId).fetchSockets();
        logger.info(
            `📡 Broadcasting ${eventName} result to battle ${battleId} (excluding sender ${senderSocketId})`
        );

        let emittedCount = 0;
        for (const roomSocket of socketsInRoom) {
            if (roomSocket.id !== senderSocketId) {
                logger.info(
                    `✅ Emitting ${eventName} to opponent socket ${roomSocket.id}`
                );
                roomSocket.emit(eventName, { userId, result });
                emittedCount++;
            } else {
                logger.info(`⏭️ Skipping sender socket ${roomSocket.id}`);
            }
        }

        logger.info(
            `✅ Broadcasted ${eventName} to ${emittedCount} opponent socket(s)`
        );
    }

    public getConnectedUsersCount(): number {
        return this.connectedUsers.size;
    }

    public getConnectedUsers(): BattleSocketUser[] {
        return Array.from(this.connectedUsers.values());
    }

    private findSocketIdByUserId(userId: string): string | null {
        logger.info(`Looking for user ${userId} in connected users`);
        logger.info(
            `Connected users: ${JSON.stringify(
                Array.from(this.connectedUsers.entries()).map(([sid, u]) => ({
                    socketId: sid,
                    userId: u.id,
                    username: u.username,
                }))
            )}`
        );

        for (const [socketId, user] of this.connectedUsers.entries()) {
            if (user.id === userId) {
                logger.info(`Found user ${userId} with socket ${socketId}`);
                return socketId;
            }
        }
        logger.warn(`User ${userId} not found in connected users map`);
        return null;
    }

    public sendBattleMatched(
        userId: string,
        data: {
            battleId: string;
            opponent: BattleSocketUser;
            problem: any;
        }
    ) {
        const socketId = this.findSocketIdByUserId(userId);
        if (socketId) {
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                logger.info(
                    `Sending battle-matched event to user ${userId} via socket ${socketId}`
                );
                logger.info(
                    `Problem data being sent:`,
                    JSON.stringify(data.problem, null, 2)
                );
                socket.emit("battle-matched", data);
            } else {
                logger.warn(
                    `Socket ${socketId} not found in active connections`
                );
            }
        } else {
            logger.warn(`User ${userId} not found in connected users`);
        }
    }
}
