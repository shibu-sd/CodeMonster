"use client";

import React, { createContext, useContext, ReactNode } from "react";
import { useBattleSocket } from "@/hooks/useBattleSocket";
import type { Socket } from "socket.io-client";
import type { BattleEvents, BattleState } from "@/hooks/useBattleSocket";

interface BattleContextValue {
    socket: Socket<BattleEvents> | null;
    connected: boolean;
    error: string | null;
    battleState: BattleState;
    connect: () => Promise<void>;
    disconnect: () => void;
    joinQueue: () => void;
    leaveQueue: () => void;
    runCode: (battleId: string, code: string, language: string) => void;
    submitCode: (battleId: string, code: string, language: string) => void;
    sendSledge: (battleId: string, message: string) => void;
    forfeitBattle: (battleId: string) => void;
    clearBattleState: () => void;
}

const BattleContext = createContext<BattleContextValue | undefined>(undefined);

export function BattleProvider({ children }: { children: ReactNode }) {
    // Single instance of useBattleSocket for the entire app
    const battleSocket = useBattleSocket();

    return (
        <BattleContext.Provider value={battleSocket}>
            {children}
        </BattleContext.Provider>
    );
}

export function useBattle() {
    const context = useContext(BattleContext);
    if (context === undefined) {
        throw new Error("useBattle must be used within a BattleProvider");
    }
    return context;
}
