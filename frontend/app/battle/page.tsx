"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/auth/protected-page";
import { HeroHeader } from "@/components/header/header";
import { useAuth } from "@clerk/nextjs";
import { useBattle } from "@/contexts/BattleContext";
import { BattleQueue } from "@/components/battle/BattleQueue";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Swords, Users, Clock, Trophy, Target } from "lucide-react";
import FooterSection from "@/components/footer/footer";

function BattlePage() {
    const { isSignedIn } = useAuth();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const battleSocket = useBattle();
    const {
        battleState,
        connected,
        connect,
        joinQueue,
        leaveQueue,
        clearBattleState,
    } = battleSocket;

    useEffect(() => {
        if (isSignedIn && !connected) {
            connect();
        }
    }, [isSignedIn, connected, connect]);

    const [isRedirecting, setIsRedirecting] = useState(false);

    useEffect(() => {
        if (
            battleState.currentBattle &&
            battleState.currentBattle.problem &&
            battleState.currentBattle.status !== "finished"
        ) {
            const problem = battleState.currentBattle.problem;
            const battleId = battleState.currentBattle.id;

            setIsRedirecting(true);

            setTimeout(() => {
                startTransition(() => {
                    router.push(
                        `/problems/${problem.slug}?battleId=${battleId}`
                    );
                });
            }, 500);
        }
    }, [battleState.currentBattle, router]);

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape" && e.ctrlKey) {
                clearBattleState();
                window.location.reload();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [clearBattleState]);

    if (!isSignedIn) {
        return (
            <div className="min-h-screen bg-background">
                <HeroHeader />

                <main className="container mx-auto px-4 pt-32 pb-16">
                    <Card className="max-w-2xl mx-auto">
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl font-bold">
                                Code Battles
                            </CardTitle>
                            <CardDescription>
                                Sign in to start 1v1 realtime coding battles
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </main>

                <FooterSection />
            </div>
        );
    }

    if (isRedirecting) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center space-y-6">
                    <div className="relative w-24 h-24 mx-auto">
                        <Swords className="w-24 h-24 text-primary animate-pulse" />
                        <div className="absolute inset-0 animate-ping">
                            <Swords className="w-24 h-24 text-primary opacity-20" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-bold text-foreground">
                            Battle Starting!
                        </h2>
                        <p className="text-muted-foreground">
                            Preparing the arena...
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <HeroHeader />

            <main className="container mx-auto px-4 pt-32 pb-16">
                <div className="space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <div className="flex justify-center items-center space-x-3">
                            <h1 className="text-4xl font-bold text-foreground">
                                Code Battles
                            </h1>
                        </div>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Challenge opponents to intense 1v1 coding duels.
                            Test your skills in real-time battles where speed
                            and accuracy determine victory!
                        </p>
                        <div className="flex justify-center items-center space-x-2 text-sm text-muted-foreground">
                            <Target className="w-4 h-4" />
                            <span>
                                First to solve wins, or highest score wins
                            </span>
                        </div>

                        {/* Connection Status */}
                        <div className="flex justify-center items-center gap-2 mt-4">
                            <Badge
                                variant={connected ? "default" : "destructive"}
                            >
                                {connected ? "Connected" : "Disconnected"}
                            </Badge>
                            {battleState.usersInQueue > 0 && (
                                <Badge variant="secondary">
                                    <Users className="w-3 h-3 mr-1" />
                                    {battleState.usersInQueue} in queue
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="max-w-4xl mx-auto">
                        <BattleQueue battleSocket={battleSocket} />
                    </div>
                </div>
            </main>

            <FooterSection />
        </div>
    );
}

export default function ProtectedBattlePage() {
    return (
        <ProtectedPage
            fallbackTitle="Authentication Required"
            fallbackMessage="You need to sign in to access Code Battles."
        >
            <BattlePage />
        </ProtectedPage>
    );
}
