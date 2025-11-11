import type { Socket } from "socket.io-client";

export interface BattleUser {
    id: string;
    username?: string;
    profileImageUrl?: string;
    battleId?: string;
}

export interface BattleProblem {
    id: string;
    title: string;
    slug: string;
    description: string;
    difficulty: string;
    timeLimit: number;
    memoryLimit: number;
}

export interface BattleEvents {
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
    "battle-matched": (data: {
        battleId: string;
        opponent: BattleUser;
        problem: BattleProblem;
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

export interface BattleState {
    isInQueue: boolean;
    currentBattle: {
        id: string;
        opponent?: BattleUser;
        problem?: BattleProblem;
        timeLimit: number;
        status: "waiting" | "active" | "finished";
        winnerId?: string;
        startTime?: number;
    } | null;
    usersInQueue: number;
    isConnected: boolean;
    error: string | null;
}

export interface BattleSocketState {
    socket: Socket<BattleEvents> | null;
    connected: boolean;
    error: string | null;
}
