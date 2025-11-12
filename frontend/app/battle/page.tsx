"use client";

import { useState, useEffect, useTransition, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { HeroHeader } from "@/components/header/header";
import { useAuth, useUser } from "@clerk/nextjs";
import { useBattle } from "@/contexts/BattleContext";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import FooterSection from "@/components/footer/footer";
import { DotPattern } from "@/components/ui/dot-pattern";

// Lazy load battle components
const BattleQueue = dynamic(
    () =>
        import("@/components/battle/battle-queue").then(
            (mod) => mod.BattleQueue
        ),
    {
        ssr: false,
        loading: () => <Skeleton className="w-full h-96" />,
    }
);

const BattleStartingAnimation = dynamic(
    () =>
        import("@/components/battle/battle-starting-animation").then(
            (mod) => mod.BattleStartingAnimation
        ),
    { ssr: false }
);

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

    const [showSkeleton, setShowSkeleton] = useState(true);
    const [isRedirecting, setIsRedirecting] = useState(false);

    // Set page title
    useEffect(() => {
        document.title = "Battle - CodeMonster";
    }, []);

    useEffect(() => {
        if (isSignedIn && !connected) {
            connect();
        }
    }, [isSignedIn, connected, connect]);

    // Handle minimum skeleton display time
    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSkeleton(false);
        }, 500);

        return () => clearTimeout(timer);
    }, []);

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

    if (showSkeleton) {
        return (
            <div className="min-h-screen bg-background relative">
                <DotPattern className="opacity-30" />
                <HeroHeader />

                <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                    <div className="mb-8 text-center">
                        <Skeleton className="h-12 w-64 mb-4 mx-auto" />
                        <Skeleton className="h-6 w-96 mb-6 mx-auto" />
                        <div className="flex justify-center items-center gap-2 mb-6">
                            <Skeleton className="h-6 w-24 rounded-full" />
                        </div>
                    </div>
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-card rounded-xl border shadow-lg p-8">
                            <Skeleton className="h-64 w-full rounded-lg" />
                        </div>
                    </div>
                </main>
                <FooterSection />
            </div>
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

                    <div className="flex justify-center items-center gap-2 mb-6">
                        <Badge variant={connected ? "default" : "destructive"}>
                            {connected ? "Connected" : "Disconnected"}
                        </Badge>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto">
                    <BattleQueue battleSocket={battleSocket} />
                </div>
            </main>

            <FooterSection />
        </div>
    );
}

export default function ProtectedBattlePage() {
    return <BattlePage />;
}
