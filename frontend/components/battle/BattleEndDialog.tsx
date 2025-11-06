"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Trophy, Skull, Swords } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface BattleEndDialogProps {
    open: boolean;
    isWinner: boolean;
    isDraw: boolean;
    opponentName?: string;
    onClose?: () => void;
}

export function BattleEndDialog({
    open,
    isWinner,
    isDraw,
    opponentName,
    onClose,
}: BattleEndDialogProps) {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [countdown, setCountdown] = useState(15);

    const redirectToBattle = useCallback(() => {
        // 1. Clear battle state FIRST (while still on problem page)
        onClose?.();

        // 2. Then navigate using replace (removes history entry)
        // Wrapped in startTransition for smoother navigation
        startTransition(() => {
            router.replace("/battle");
        });
    }, [onClose, router]);

    useEffect(() => {
        if (!open) {
            setCountdown(15);
            return;
        }

        const interval = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 1000);

        return () => clearInterval(interval);
    }, [open]);

    // Separate effect to handle redirect when countdown reaches 0
    useEffect(() => {
        if (open && countdown <= 0) {
            redirectToBattle();
        }
    }, [countdown, open, redirectToBattle]);

    const handleOpenChange = (newOpen: boolean) => {
        // If user tries to close dialog, redirect to battle page
        if (!newOpen) {
            redirectToBattle();
        }
    };

    const getTitle = () => {
        if (isDraw) return "Battle Draw!";
        return isWinner ? "Insane Victory!" : "Defeat";
    };

    const getMessage = () => {
        if (isDraw) {
            return "Neither warrior could claim victory this time. A worthy challenge!";
        }
        if (isWinner) {
            return `You've crushed ${
                opponentName || "your opponent"
            }! Your coding skills reign supreme!`;
        }
        return `${
            opponentName || "Your opponent"
        } claimed victory this time. Better luck next time, warrior!`;
    };

    const getIcon = () => {
        if (isDraw) {
            return (
                <Swords className="w-24 h-24 text-yellow-500 mx-auto animate-pulse" />
            );
        }
        if (isWinner) {
            return (
                <Trophy className="w-24 h-24 text-yellow-500 mx-auto animate-bounce" />
            );
        }
        return <Skull className="w-24 h-24 text-red-500 mx-auto" />;
    };

    const getBackgroundColor = () => {
        if (isDraw) return "bg-yellow-50 dark:bg-yellow-950/20";
        if (isWinner) return "bg-green-50 dark:bg-green-950/20";
        return "bg-red-50 dark:bg-red-950/20";
    };

    const getTitleColor = () => {
        if (isDraw) return "text-yellow-700 dark:text-yellow-400";
        if (isWinner) return "text-green-700 dark:text-green-400";
        return "text-red-700 dark:text-red-400";
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent
                className={`sm:max-w-md ${getBackgroundColor()}`}
                onPointerDownOutside={redirectToBattle}
                onEscapeKeyDown={redirectToBattle}
            >
                <DialogHeader className="space-y-4">
                    <div className="pt-6">{getIcon()}</div>
                    <DialogTitle
                        className={`text-3xl font-bold text-center ${getTitleColor()}`}
                    >
                        {getTitle()}
                    </DialogTitle>
                    <DialogDescription className="text-center text-lg text-foreground">
                        {getMessage()}
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    {/* Countdown Timer */}
                    <div className="space-y-2">
                        <div className="text-sm text-center text-muted-foreground">
                            Redirecting to battle lobby in {countdown}s
                        </div>
                        <Progress
                            value={(countdown / 15) * 100}
                            className="h-2"
                        />
                    </div>

                    {/* Action Button */}
                    <Button
                        onClick={redirectToBattle}
                        size="lg"
                        className="w-full"
                    >
                        <Swords className="w-4 h-4 mr-2" />
                        Go to Battle Lobby
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
