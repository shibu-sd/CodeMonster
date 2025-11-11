"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuth } from "@clerk/nextjs";
import { io, Socket } from "socket.io-client";
import type { BattleEvents, BattleState } from "@/types";

let globalSocket: Socket<BattleEvents> | null = null;
let globalSocketRefCount = 0;

export function useBattleSocket() {
    const { getToken, isSignedIn } = useAuth();
    const [socket, setSocket] = useState<Socket<BattleEvents> | null>(
        () => globalSocket
    );
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [battleState, setBattleState] = useState<BattleState>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("battleState");
            if (saved) {
                try {
                    const parsed = JSON.parse(saved);

                    const battleAge =
                        Date.now() - (parsed.currentBattle?.timestamp || 0);
                    const maxBattleAge = 60 * 60 * 1000; // 1 hour max
                    const isBattleValid =
                        parsed.currentBattle &&
                        battleAge < maxBattleAge &&
                        parsed.currentBattle.status !== "finished";

                    if (isBattleValid) {
                        return {
                            ...parsed,
                            isConnected: false,
                            error: null,
                        };
                    } else {
                        localStorage.removeItem("battleState");
                    }
                } catch (e) {
                    console.error("Failed to parse saved battle state:", e);
                    localStorage.removeItem("battleState");
                }
            }
        }
        return {
            isInQueue: false,
            currentBattle: null,
            usersInQueue: 0,
            isConnected: false,
            error: null,
        };
    });
    const reconnectAttempts = useRef(0);
    const MAX_RECONNECT_ATTEMPTS = 5;

    const updateBattleState = useCallback(
        (newState: BattleState | ((prev: BattleState) => BattleState)) => {
            setBattleState((prev) => {
                const updatedState =
                    typeof newState === "function" ? newState(prev) : newState;

                if (updatedState.currentBattle) {
                    (updatedState.currentBattle as any).timestamp = Date.now();
                }

                if (typeof window !== "undefined") {
                    localStorage.setItem(
                        "battleState",
                        JSON.stringify(updatedState)
                    );
                }

                return updatedState;
            });
        },
        []
    );

    const connect = useCallback(async () => {
        if (!isSignedIn) {
            setError("You must be signed in to use battle features");
            return;
        }

        if (globalSocket && globalSocket.connected) {
            setSocket(globalSocket);
            setConnected(true);
            globalSocketRefCount++;
            return;
        }

        if (globalSocket) {
            setSocket(globalSocket);
            return;
        }

        try {
            const token = await getToken();
            if (!token) {
                throw new Error("Authentication token not available");
            }

            const newSocket = io(
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
                {
                    auth: {
                        token,
                    },
                    transports: ["websocket", "polling"],
                    path: "/socket.io",
                }
            );

            globalSocket = newSocket;
            globalSocketRefCount = 1;

            newSocket.on("connect", () => {
                setConnected(true);
                setError(null);

                setBattleState((prev) => {
                    const currentBattle = prev.currentBattle;
                    if (currentBattle && currentBattle.status !== "finished") {
                        newSocket.emit("join-battle", currentBattle.id);
                    }
                    return { ...prev, isConnected: true };
                });

                reconnectAttempts.current = 0;
            });

            newSocket.on("disconnect", () => {
                setConnected(false);
                setBattleState((prev) => ({ ...prev, isConnected: false }));
            });

            newSocket.on("connect_error", (err) => {
                console.error("Battle socket connection error:", err);
                setError("Failed to connect to battle server");
                setBattleState((prev) => ({
                    ...prev,
                    error: "Connection failed",
                }));

                if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
                    reconnectAttempts.current++;
                    setTimeout(() => {
                        newSocket.connect();
                    }, Math.pow(2, reconnectAttempts.current) * 1000); // Exponential backoff
                }
            });

            // Battle events
            newSocket.on("queue-status", (data) => {
                setBattleState((prev) => ({
                    ...prev,
                    usersInQueue: data.usersInQueue,
                }));
            });

            newSocket.on("battle-matched", (data) => {
                updateBattleState((prev) => {
                    return {
                        ...prev,
                        isInQueue: false,
                        currentBattle: {
                            id: data.battleId,
                            opponent: data.opponent,
                            problem: data.problem,
                            timeLimit: 1800, // Default 30 minutes
                            status: "waiting",
                        },
                    };
                });

                // Auto-join the battle room
                newSocket.emit("join-battle", data.battleId);
            });

            newSocket.on("battle-start", (data) => {
                updateBattleState((prev) => {
                    if (!prev.currentBattle) {
                        return prev;
                    }

                    return {
                        ...prev,
                        currentBattle: {
                            ...prev.currentBattle,
                            status: "active",
                            timeLimit: data.timeLimit,
                            startTime: Date.now(),
                        },
                    };
                });
            });

            newSocket.on("battle-run-result", (data) => {
                if (typeof window !== "undefined") {
                    const event = new CustomEvent("battle-opponent-action", {
                        detail: {
                            type: "run",
                            userId: data.userId,
                            result: data.result,
                        },
                    });
                    window.dispatchEvent(event);
                }
            });

            newSocket.on("battle-submit-result", (data) => {
                if (typeof window !== "undefined") {
                    const event = new CustomEvent("battle-opponent-action", {
                        detail: {
                            type: "submit",
                            userId: data.userId,
                            result: data.result,
                        },
                    });
                    window.dispatchEvent(event);
                }
            });

            newSocket.on("battle-finish", (data) => {
                updateBattleState((prev) => ({
                    ...prev,
                    currentBattle: prev.currentBattle
                        ? {
                              ...prev.currentBattle,
                              status: "finished",
                              winnerId: data.winnerId,
                          }
                        : null,
                }));
            });

            newSocket.on("battle-opponent-disconnected", (data) => {
                updateBattleState((prev) => ({
                    ...prev,
                    currentBattle: prev.currentBattle
                        ? {
                              ...prev.currentBattle,
                              status: "finished",
                              winnerId:
                                  prev.currentBattle?.opponent?.id !==
                                  data.userId
                                      ? prev.currentBattle.opponent?.id
                                      : undefined,
                          }
                        : null,
                }));
            });

            newSocket.on("battle-opponent-reconnected", (data) => {});

            newSocket.on("battle-message-received", (data) => {
                if (typeof window !== "undefined") {
                    const event = new CustomEvent("battle-message-received", {
                        detail: data,
                    });
                    window.dispatchEvent(event);
                }
            });

            newSocket.on("battle-error", (data) => {
                console.error("Battle error:", data);
                setError(data.message);
                setBattleState((prev) => ({ ...prev, error: data.message }));
            });

            setSocket(newSocket);
        } catch (err) {
            console.error("Failed to initialize battle socket:", err);
            setError("Failed to initialize battle connection");
        }
    }, [getToken, isSignedIn]);

    const disconnect = useCallback(() => {
        if (globalSocket) {
            globalSocketRefCount--;

            if (globalSocketRefCount <= 0) {
                globalSocket.disconnect();
                globalSocket = null;
                globalSocketRefCount = 0;
            }

            setSocket(null);
            setConnected(false);
            updateBattleState((prev) => ({
                ...prev,
                isInQueue: false,
                isConnected: false,
                error: null,
            }));
        }
    }, [updateBattleState]);

    const joinQueue = useCallback(() => {
        if (socket && connected) {
            socket.emit("join-battle-queue");
            setBattleState((prev) => ({ ...prev, isInQueue: true }));
        }
    }, [socket, connected]);

    const leaveQueue = useCallback(() => {
        if (socket && connected) {
            socket.emit("leave-battle-queue");
            setBattleState((prev) => ({ ...prev, isInQueue: false }));
        }
    }, [socket, connected]);

    const runCode = useCallback(
        (battleId: string, code: string, language: string) => {
            if (socket && connected) {
                socket.emit("battle-run", { battleId, code, language });
            }
        },
        [socket, connected]
    );

    const submitCode = useCallback(
        (battleId: string, code: string, language: string) => {
            if (socket && connected) {
                socket.emit("battle-submit", { battleId, code, language });
            }
        },
        [socket, connected]
    );

    const sendMessage = useCallback(
        (battleId: string, message: string) => {
            if (socket && connected) {
                socket.emit("battle-message", { battleId, message });
            }
        },
        [socket, connected]
    );

    const forfeitBattle = useCallback(
        (battleId: string) => {
            if (socket && connected) {
                socket.emit("battle-forfeit", battleId);
            }
        },
        [socket, connected]
    );

    const clearBattleState = useCallback(() => {
        updateBattleState({
            isInQueue: false,
            currentBattle: null,
            usersInQueue: 0,
            isConnected: connected,
            error: null,
        });
    }, [connected, updateBattleState]);

    useEffect(() => {
        if (
            isSignedIn &&
            !socket &&
            battleState.currentBattle &&
            battleState.currentBattle.status !== "finished"
        ) {
            connect();
        }

        return () => {};
    }, [isSignedIn, socket, battleState.currentBattle, connect]);

    return {
        socket,
        connected,
        error,
        battleState,
        connect,
        disconnect,
        joinQueue,
        leaveQueue,
        runCode,
        submitCode,
        sendMessage,
        forfeitBattle,
        clearBattleState,
    };
}
