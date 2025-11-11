"use client";

import { useState, useEffect } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import type { BattleTimerProps } from "@/types";

export function BattleTimer({
    startTime,
    timeLimit,
    onTimeUp,
}: BattleTimerProps) {
    const [timeRemaining, setTimeRemaining] = useState(timeLimit);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        console.log(
            "⏰ BattleTimer - startTime:",
            startTime,
            "timeLimit:",
            timeLimit
        );

        if (!startTime) {
            console.log("⚠️ No startTime, timer not running");
            setTimeRemaining(timeLimit);
            return;
        }

        console.log("✅ Starting timer!");
        setIsRunning(true);

        const interval = setInterval(() => {
            const now = new Date().getTime();
            const start = startTime.getTime();
            const elapsed = Math.floor((now - start) / 1000);
            const remaining = Math.max(0, timeLimit - elapsed);

            console.log(
                `⏱️ Timer tick: ${remaining}s remaining (elapsed: ${elapsed}s)`
            );
            setTimeRemaining(remaining);

            if (remaining === 0) {
                console.log("⏰ Time's up!");
                setIsRunning(false);
                onTimeUp?.();
            }
        }, 1000);

        return () => {
            console.log("🛑 Timer cleanup");
            clearInterval(interval);
        };
    }, [startTime, timeLimit, onTimeUp]);

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${secs
                .toString()
                .padStart(2, "0")}`;
        }

        return `${minutes}:${secs.toString().padStart(2, "0")}`;
    };

    const getTimeColor = () => {
        if (timeRemaining <= 60) return "text-destructive"; // Last minute
        if (timeRemaining <= 300) return "text-orange-500"; // Last 5 minutes
        return "text-foreground";
    };

    return (
        <div className="flex items-center gap-2">
            <Clock className={`w-4 h-4 ${getTimeColor()}`} />
            <div className="text-sm font-mono font-bold">
                <span className={getTimeColor()}>
                    {formatTime(timeRemaining)}
                </span>
            </div>
            {timeRemaining <= 60 && (
                <AlertTriangle className="w-3 h-3 text-destructive animate-pulse" />
            )}
        </div>
    );
}
