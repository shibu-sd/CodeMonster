"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, AlertCircle, Swords } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import type { BattleQueueProps } from "@/types";
import { BATTLE_TIPS } from "./battle-config";

export function BattleQueue({ battleSocket }: BattleQueueProps) {
    const { battleState, connected, joinQueue, leaveQueue } = battleSocket;
    const [searchingTime, setSearchingTime] = useState(0);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    useEffect(() => {
        if (battleState.isInQueue) {
            const interval = setInterval(() => {
                setSearchingTime((prev) => prev + 1);
            }, 1000);
            return () => clearInterval(interval);
        } else {
            setSearchingTime(0);
        }
    }, [battleState.isInQueue]);

    // Rotate battle tips
    useEffect(() => {
        if (battleState.isInQueue) {
            const interval = setInterval(() => {
                setCurrentTipIndex((prev) => (prev + 1) % BATTLE_TIPS.length);
            }, 5000);
            return () => clearInterval(interval);
        }
    }, [battleState.isInQueue]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, "0")}`;
    };

    if (!connected) {
        return (
            <div className="bg-gradient-to-br from-secondary/5 via-secondary/10 to-secondary/5 border-2 border-secondary/20 rounded-xl p-8 shadow-lg">
                <div className="text-center space-y-4">
                    <div className="flex items-center justify-center gap-3 mb-3">
                        <div className="p-3 bg-secondary/10 rounded-lg">
                            <AlertCircle className="w-8 h-8 text-secondary" />
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-foreground">
                        Connection Required
                    </h3>
                    <p className="text-base text-muted-foreground font-medium">
                        Please wait while we connect to the battle server...
                    </p>
                </div>
            </div>
        );
    }

    if (battleState.isInQueue) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-8 shadow-lg">
                    <div className="text-center space-y-4">
                        <div className="w-16 h-16 mx-auto relative">
                            <Swords className="w-16 h-16 text-primary animate-pulse" />
                            <div className="absolute inset-0 animate-ping">
                                <Swords className="w-16 h-16 text-primary opacity-20" />
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold">
                            Queueing Chaos...
                        </h3>
                        <p className="text-lg text-muted-foreground">
                            Summoning a monster to battle
                        </p>

                        <div className="mt-6 min-h-[60px] flex items-center justify-center overflow-hidden">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentTipIndex}
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: 20 }}
                                    transition={{
                                        duration: 0.25,
                                        ease: "easeOut",
                                    }}
                                    className="text-base font-medium text-foreground"
                                >
                                    <span className="font-semibold">
                                        💡 Battle Tip:
                                    </span>{" "}
                                    {BATTLE_TIPS[currentTipIndex]}
                                </motion.div>
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <button
                    onClick={leaveQueue}
                    className="w-full px-6 py-4 rounded-full bg-red-800 font-bold text-white tracking-widest uppercase transform hover:scale-105 hover:bg-red-900 transition-all duration-200"
                >
                    Leave Queue
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="bg-gradient-to-br from-primary/5 via-primary/10 to-primary/5 border-2 border-primary/20 rounded-xl p-6 shadow-lg">
                <div className="flex items-center justify-center gap-2 mb-5">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Shield className="w-6 h-6 text-primary" />
                    </div>
                    <h4 className="font-bold text-xl text-foreground">
                        Battle Rules
                    </h4>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3 bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium">
                            Random problem selection
                        </span>
                    </div>
                    <div className="flex items-start gap-3 bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium">
                            30-minute time limit
                        </span>
                    </div>
                    <div className="flex items-start gap-3 bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium">
                            First AC wins
                        </span>
                    </div>
                    <div className="flex items-start gap-3 bg-background/50 rounded-lg p-3 border border-border/50">
                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0"></div>
                        <span className="text-sm font-medium">
                            Real-time opponent tracking
                        </span>
                    </div>
                </div>
            </div>

            {battleState.usersInQueue > 0 ? (
                <div className="text-center">
                    <Badge variant="secondary" className="text-base px-4 py-2">
                        <Users className="w-4 h-4 mr-2" />
                        {battleState.usersInQueue} player
                        {battleState.usersInQueue !== 1 ? "s" : ""} waiting
                    </Badge>
                </div>
            ) : (
                <div className="text-center">
                    <p className="text-muted-foreground font-medium">
                        No one in queue right now. Be the first to join!
                    </p>
                </div>
            )}

            <button
                onClick={joinQueue}
                className="w-full px-6 py-4 rounded-full bg-primary font-bold text-primary-foreground tracking-widest uppercase transform hover:scale-105 hover:bg-primary/90 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={!connected}
            >
                Join Battle Queue
            </button>
        </div>
    );
}
