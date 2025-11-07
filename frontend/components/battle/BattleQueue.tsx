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
import {
    Swords,
    Users,
    Clock,
    Zap,
    Shield,
    Trophy,
    AlertCircle,
} from "lucide-react";

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
            <Card className="max-w-2xl mx-auto">
                <CardHeader className="text-center">
                    <AlertCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                    <CardTitle>Connection Required</CardTitle>
                    <CardDescription>
                        Please wait while we connect to the battle server...
                    </CardDescription>
                </CardHeader>
            </Card>
        );
    }

    if (battleState.isInQueue) {
        return (
            <Card className="max-w-2xl mx-auto border-primary">
                <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 relative">
                        <Swords className="w-16 h-16 text-primary animate-pulse" />
                        <div className="absolute inset-0 animate-ping">
                            <Swords className="w-16 h-16 text-primary opacity-20" />
                        </div>
                    </div>
                    <CardTitle className="text-2xl">
                        Finding Opponent...
                    </CardTitle>
                    <CardDescription className="text-lg">
                        Searching for a worthy challenger
                    </CardDescription>

                    <div className="mt-4 space-y-2">
                        <div className="text-sm text-muted-foreground">
                            Search time: {formatTime(searchingTime)}
                        </div>
                        <Progress
                            value={Math.min(searchingTime / 2, 100)}
                            className="w-full"
                        />
                    </div>
                </CardHeader>

                <CardContent className="text-center space-y-6">
                    {/* Queue Stats */}
                    <div className="grid grid-cols-3 gap-4 text-center">
                        <div className="space-y-2">
                            <Users className="w-8 h-8 mx-auto text-primary" />
                            <div className="text-2xl font-bold">
                                {battleState.usersInQueue}
                            </div>
                            <div className="text-sm text-muted-foreground">
                                In Queue
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Clock className="w-8 h-8 mx-auto text-primary" />
                            <div className="text-2xl font-bold">&lt;30s</div>
                            <div className="text-sm text-muted-foreground">
                                Avg Wait
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Trophy className="w-8 h-8 mx-auto text-primary" />
                            <div className="text-2xl font-bold">50%</div>
                            <div className="text-sm text-muted-foreground">
                                Win Rate
                            </div>
                        </div>
                    </div>

                    {/* Battle Tips */}
                    <div className="bg-muted/50 rounded-lg p-4 text-left">
                        <h4 className="font-semibold mb-2 text-center">
                            🎯 Battle Tips
                        </h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                            <li>
                                • Problems are randomly selected from our
                                database
                            </li>
                            <li>• First to get Accepted (AC) wins instantly</li>
                            <li>• If time expires, highest score wins</li>
                            <li>• You have 30 minutes to solve the problem</li>
                            <li>
                                • Run and submit events are visible to your
                                opponent
                            </li>
                        </ul>
                    </div>

                    <Button
                        onClick={leaveQueue}
                        variant="outline"
                        size="lg"
                        className="w-full"
                    >
                        Leave Queue
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardHeader className="text-center">
                <Swords className="w-16 h-16 mx-auto text-primary mb-4" />
                <CardTitle className="text-2xl">Ready to Battle?</CardTitle>
                <CardDescription className="text-lg">
                    Jump into the matchmaking queue and challenge opponents in
                    real-time coding duels
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Users className="w-8 h-8 mx-auto text-primary mb-2" />
                        <div className="text-2xl font-bold">
                            {battleState.usersInQueue}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Players Waiting
                        </div>
                    </div>
                    <div className="text-center p-4 bg-muted/50 rounded-lg">
                        <Zap className="w-8 h-8 mx-auto text-primary mb-2" />
                        <div className="text-2xl font-bold">Fast</div>
                        <div className="text-sm text-muted-foreground">
                            Matchmaking
                        </div>
                    </div>
                </div>

                {/* Battle Rules */}
                <div className="bg-muted/30 rounded-lg p-4">
                    <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-4 h-4" />
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
                            className="text-base px-3 py-1"
                        >
                            <Users className="w-4 h-4 mr-2" />
                            {battleState.usersInQueue} player
                            {battleState.usersInQueue !== 1 ? "s" : ""} waiting
                        </Badge>
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground">
                        <p>No one in queue right now. Be the first to join!</p>
                    </div>
                )}

                {/* Join Queue Button */}
                <Button
                    onClick={joinQueue}
                    size="lg"
                    className="w-full text-base py-6"
                    disabled={!connected}
                >
                    <Swords className="w-5 h-5 mr-2" />
                    Join Battle Queue
                </Button>
            </CardContent>
        </Card>
    );
}
