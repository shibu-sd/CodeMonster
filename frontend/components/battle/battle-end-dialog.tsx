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
import type { BattleEndDialogProps } from "@/types";

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
        onClose?.();
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

    useEffect(() => {
        if (open && countdown <= 0) {
            redirectToBattle();
        }
    }, [countdown, open, redirectToBattle]);

    const handleOpenChange = (newOpen: boolean) => {
        if (!newOpen) {
            redirectToBattle();
        }
    };

    const getTitle = () => {
        if (isDraw) return "Battle Draw!";
        return isWinner ? "Victory" : "Defeat";
    };

    const getMessage = () => {
        if (isDraw) {
            return "Neither warrior could claim victory this time. A worthy challenge.";
        }
        if (isWinner) {
            return `${
                opponentName || "Your opponent"
            } faced pure monster energy.`;
        }
        return `The arena sides with ${
            opponentName || "your opponent"
        } today. Tomorrow, it's yours.`;
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
        return (
            <div className="relative">
                <Skull className="w-24 h-24 text-red-500 mx-auto animate-bounce" />
            </div>
        );
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
                    <div className="space-y-2">
                        <div className="text-sm text-center text-muted-foreground">
                            Redirecting to battle lobby in {countdown}s
                        </div>
                        <Progress
                            value={(countdown / 15) * 100}
                            className="h-2"
                        />
                    </div>

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
