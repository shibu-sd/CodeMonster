"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/auth/protected-page";
import { HeroHeader } from "@/components/header/header";
import { useAuth, useUser } from "@clerk/nextjs";
import { useBattle } from "@/contexts/BattleContext";
import { BattleQueue } from "@/components/battle/BattleQueue";
import { BattleStartingAnimation } from "@/components/battle/BattleStartingAnimation";
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
    const { user } = useUser();
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
            }, 5000);
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
            <BattleStartingAnimation
                currentUser={{
                    username: user?.username || user?.firstName || "You",
                    profileImageUrl: user?.imageUrl,
                }}
                opponent={{
                    username:
                        battleState.currentBattle?.opponent?.username ||
                        "Opponent",
                    profileImageUrl:
                        battleState.currentBattle?.opponent?.profileImageUrl,
                }}
            />
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
                            Face fierce monsters in live 1v1 coding duels
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
