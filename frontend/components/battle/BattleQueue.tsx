"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Shield, AlertCircle, Swords } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

interface BattleQueueProps {
    battleSocket: ReturnType<
        typeof import("@/hooks/useBattleSocket").useBattleSocket
    >;
}

export function BattleQueue({ battleSocket }: BattleQueueProps) {
    const { battleState, connected, joinQueue, leaveQueue } = battleSocket;
    const [searchingTime, setSearchingTime] = useState(0);
    const [currentTipIndex, setCurrentTipIndex] = useState(0);

    const battleTips = [
        "Ctrl + Z won’t undo that WA",
        "When in doubt, blame the test cases",
        "TLEs exist to humble brute force",
        "Keyboard clacks = confidence. Type loud",
        "Real monsters don’t Google mid-battle (well, maybe once)",
        "Brute force isn’t dumb if it works",
        "Clean code wins ugly battles",
        "Runtime Errors are just loud edge cases",
    ];

    // Update search time when in queue
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
                setCurrentTipIndex((prev) => (prev + 1) % battleTips.length);
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
            <Card className="max-w-2xl mx-auto border shadow-lg">
                <CardHeader className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                    <CardTitle className="text-2xl">
                        Connection Required
                    </CardTitle>
                    <CardDescription className="text-base">
                        Please wait while we connect to the battle server...
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (battleState.isInQueue) {
        return (
            <div className="max-w-2xl mx-auto space-y-6">
                {/* Main Card with Queueing Chaos */}
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

                        {/* Rotating Battle Tips */}
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
                                    {battleTips[currentTipIndex]}
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
            {/* Battle Rules */}
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

            {/* Queue Status */}
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

            {/* Join Queue Button */}
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
