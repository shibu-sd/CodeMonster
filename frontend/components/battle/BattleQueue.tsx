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
import { Progress } from "@/components/ui/progress";
import { Swords, Users, Shield, AlertCircle } from "lucide-react";

interface BattleQueueProps {
    battleSocket: ReturnType<
        typeof import("@/hooks/useBattleSocket").useBattleSocket
    >;
}

export function BattleQueue({ battleSocket }: BattleQueueProps) {
    const { battleState, connected, joinQueue, leaveQueue } = battleSocket;
    const [searchingTime, setSearchingTime] = useState(0);

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
            <Card className="max-w-2xl mx-auto border-primary shadow-lg">
                <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                        <Swords className="w-16 h-16 text-primary animate-pulse" />
                        <div className="absolute inset-0 animate-ping">
                            <Swords className="w-16 h-16 text-primary opacity-20" />
                        </div>
                    </div>
                    <CardTitle className="text-3xl font-bold">
                        Queueing Chaos...
                    </CardTitle>
                    <CardDescription className="text-lg mt-2">
                        Summoning a monster to battle
                    </CardDescription>

                    <div className="mt-6 space-y-3">
                        <div className="text-base font-medium text-foreground">
                            Search time: {formatTime(searchingTime)}
                        </div>
                        <Progress
                            value={Math.min(searchingTime / 2, 100)}
                            className="w-full h-2"
                        />
                    </div>
                </CardHeader>

                <CardContent className="text-center space-y-6 pt-2">
                    {/* Battle Tips */}
                    <div className="bg-muted/30 border rounded-lg p-5 text-left">
                        <h4 className="font-bold mb-3 text-center text-lg flex items-center justify-center gap-2">
                            <Shield className="w-5 h-5" />
                            Battle Tips
                        </h4>
                        <ul className="text-sm space-y-2">
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                                <span>
                                    Problems are randomly selected from our
                                    database
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                                <span>
                                    First to get Accepted (AC) wins instantly
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                                <span>If time expires, highest score wins</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                                <span>
                                    You have 30 minutes to solve the problem
                                </span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                                <span>
                                    Run and submit events are visible to your
                                    opponent
                                </span>
                            </li>
                        </ul>
                    </div>

                    <Button
                        onClick={leaveQueue}
                        variant="outline"
                        size="lg"
                        className="w-full text-base py-6"
                    >
                        Leave Queue
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto shadow-lg border">
            <CardHeader className="text-center pb-4">
                <Swords className="w-16 h-16 mx-auto text-primary mb-4" />
                <CardTitle className="text-3xl font-bold">
                    Ready to Battle?
                </CardTitle>
                <CardDescription className="text-lg mt-2">
                    Jump into the matchmaking queue and challenge opponents in
                    real-time coding duels
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6 pt-2">
                {/* Battle Rules */}
                <div className="bg-muted/30 border rounded-lg p-5">
                    <h4 className="font-bold mb-3 text-lg flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        Battle Rules
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                            <span>Random problem selection</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                            <span>30-minute time limit</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                            <span>First AC wins</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5"></div>
                            <span>Real-time opponent tracking</span>
                        </div>
                    </div>
                </div>

                {/* Queue Status */}
                {battleState.usersInQueue > 0 ? (
                    <div className="text-center">
                        <Badge
                            variant="secondary"
                            className="text-base px-4 py-2"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            {battleState.usersInQueue} player
                            {battleState.usersInQueue !== 1 ? "s" : ""} waiting
                        </Badge>
                    </div>
                ) : (
                    <div className="text-center bg-muted/20 rounded-lg p-4 border">
                        <p className="text-muted-foreground font-medium">
                            No one in queue right now. Be the first to join!
                        </p>
                    </div>
                )}

                {/* Join Queue Button */}
                <Button
                    onClick={joinQueue}
                    size="lg"
                    className="w-full text-base py-6 shadow-md hover:shadow-lg transition-shadow"
                    disabled={!connected}
                >
                    <Swords className="w-5 h-5 mr-2" />
                    Join Battle Queue
                </Button>
            </CardContent>
        </Card>
    );
}
