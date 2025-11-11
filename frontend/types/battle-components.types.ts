export interface BattleChatBoxProps {
    battleId: string;
    currentUserId: string;
    opponentUsername?: string;
    onSendMessage: (message: string) => void;
}

export interface BattleEndDialogProps {
    open: boolean;
    isWinner: boolean;
    isDraw: boolean;
    opponentName?: string;
    onClose?: () => void;
}

export interface BattleQueueProps {
    battleSocket: ReturnType<
        typeof import("@/hooks/useBattleSocket").useBattleSocket
    >;
}

export interface BattleStartingAnimationProps {
    currentUser: {
        username?: string;
        profileImageUrl?: string;
    };
    opponent: {
        username?: string;
        profileImageUrl?: string;
    };
}

export interface BattleTimerProps {
    startTime?: Date | null;
    timeLimit: number;
    onTimeUp?: () => void;
}
