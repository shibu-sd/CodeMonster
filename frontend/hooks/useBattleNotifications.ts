import { useState, useEffect } from "react";
import { BattleNotification } from "@/types";

interface BattleState {
    currentBattle?: {
        id: string;
        status: string;
        winnerId?: string;
        opponent?: {
            id: string;
            username?: string;
            profileImageUrl?: string;
        };
    } | null;
}

interface UseBattleNotificationsProps {
    battleState: BattleState;
    onClearBattleState: () => void;
}

export function useBattleNotifications({
    battleState,
    onClearBattleState,
}: UseBattleNotificationsProps) {
    const [battleNotifications, setBattleNotifications] = useState<
        BattleNotification[]
    >([]);
    const [showBattleEndDialog, setShowBattleEndDialog] = useState(false);
    const [battleEndData, setBattleEndData] = useState<{
        isWinner: boolean;
        isDraw: boolean;
        opponentName?: string;
    } | null>(null);

    useEffect(() => {
        if (battleState.currentBattle?.status === "finished") {
            const winnerId = battleState.currentBattle.winnerId;
            const opponentId = battleState.currentBattle.opponent?.id;
            const opponentName = battleState.currentBattle.opponent?.username;

            console.log("🏆 Battle finished - Winner detection:", {
                winnerId,
                opponentId,
                winnerIdType: typeof winnerId,
                opponentIdType: typeof opponentId,
                opponentMatch: winnerId === opponentId,
            });

            const isDraw = !winnerId;
            const isWinner = Boolean(
                winnerId && opponentId && winnerId !== opponentId
            );

            console.log("🏆 Final determination:", { isWinner, isDraw });

            setBattleEndData({
                isWinner,
                isDraw,
                opponentName,
            });
            setShowBattleEndDialog(true);
        }
    }, [
        battleState.currentBattle?.status,
        battleState.currentBattle?.winnerId,
        battleState.currentBattle?.opponent,
    ]);

    useEffect(() => {
        if (!battleState.currentBattle) {
            return;
        }

        const handleOpponentAction = (event: any) => {
            const { type, userId, result } = event.detail;

            if (battleState.currentBattle?.opponent?.id !== userId) {
                return;
            }

            const opponentName =
                battleState.currentBattle?.opponent?.username || "Opponent";

            let message = "";
            if (result) {
                const status = result.status;
                const testsPassed = result.testCasesPassed || 0;
                const totalTests = result.totalTestCases || 0;

                if (type === "run") {
                    if (status === "ACCEPTED") {
                        message = `${opponentName} ran code - ✅ All tests passed (${testsPassed}/${totalTests})`;
                    } else if (status === "WRONG_ANSWER") {
                        message = `${opponentName} ran code - ❌ Wrong answer (${testsPassed}/${totalTests})`;
                    } else {
                        message = `${opponentName} ran code - ${status}`;
                    }
                } else {
                    if (status === "ACCEPTED") {
                        message = `${opponentName} submitted - ✅ Accepted!`;
                    } else if (status === "WRONG_ANSWER") {
                        message = `${opponentName} submitted - ❌ Wrong answer`;
                    } else {
                        message = `${opponentName} submitted - ${status}`;
                    }
                }
            } else {
                message =
                    type === "run"
                        ? `${opponentName} ran their code`
                        : `${opponentName} submitted their code`;
            }

            const notification: BattleNotification = {
                id: `${Date.now()}-${Math.random()}`,
                message,
                type,
                timestamp: Date.now(),
                avatarUrl: battleState.currentBattle?.opponent?.profileImageUrl,
                username: opponentName,
            };

            setBattleNotifications((prev) => [...prev, notification]);

            setTimeout(() => {
                setBattleNotifications((prev) =>
                    prev.filter((n) => n.id !== notification.id)
                );
            }, 5000);
        };

        const handleMessageReceived = (event: any) => {
            const { userId, message: text } = event.detail;

            if (battleState.currentBattle?.opponent?.id !== userId) {
                return;
            }

            const opponentName =
                battleState.currentBattle?.opponent?.username || "Opponent";

            const notification: BattleNotification = {
                id: `${Date.now()}-${Math.random()}`,
                message: text,
                type: "message",
                timestamp: Date.now(),
                avatarUrl: battleState.currentBattle?.opponent?.profileImageUrl,
                username: opponentName,
            };

            setBattleNotifications((prev) => [...prev, notification]);

            setTimeout(() => {
                setBattleNotifications((prev) =>
                    prev.filter((n) => n.id !== notification.id)
                );
            }, 5000);
        };

        window.addEventListener("battle-opponent-action", handleOpponentAction);
        window.addEventListener(
            "battle-message-received",
            handleMessageReceived
        );

        return () => {
            window.removeEventListener(
                "battle-opponent-action",
                handleOpponentAction
            );
            window.removeEventListener(
                "battle-message-received",
                handleMessageReceived
            );
        };
    }, [battleState.currentBattle]);

    const handleBattleEndDialogClose = () => {
        setShowBattleEndDialog(false);
        onClearBattleState();
    };

    return {
        battleNotifications,
        showBattleEndDialog,
        battleEndData,
        handleBattleEndDialogClose,
    };
}
