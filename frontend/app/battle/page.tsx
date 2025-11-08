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
import { Badge } from "@/components/ui/badge";
import { Target } from "lucide-react";
import FooterSection from "@/components/footer/footer";
import { DotPattern } from "@/components/ui/dot-pattern";

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
            <div className="min-h-screen bg-background relative">
                <DotPattern className="opacity-30" />
                <HeroHeader />

                <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
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
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />

            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold mb-4">Code Battles</h1>
                    <p className="text-xl text-muted-foreground mb-6 max-w-2xl mx-auto">
                        Face fierce monsters in live 1v1 coding duels
                    </p>

                    {/* Connection Status */}
                    <div className="flex justify-center items-center gap-2 mb-6">
                        <Badge variant={connected ? "default" : "destructive"}>
                            {connected ? "Connected" : "Disconnected"}
                        </Badge>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-4xl mx-auto">
                    <BattleQueue battleSocket={battleSocket} />
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
