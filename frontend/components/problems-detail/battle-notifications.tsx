"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BattleNotification } from "@/types";

interface BattleNotificationsProps {
    notifications: BattleNotification[];
}

export function BattleNotifications({
    notifications,
}: BattleNotificationsProps) {
    if (notifications.length === 0) return null;

    return (
        <div className="fixed bottom-20 right-4 z-50 space-y-2">
            {notifications.map((notification) => (
                <div
                    key={notification.id}
                    className={`px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right ${
                        notification.type === "run"
                            ? "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
                            : notification.type === "message"
                            ? "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800"
                            : "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8 border-2">
                            <AvatarImage src={notification.avatarUrl} />
                            <AvatarFallback className="text-xs">
                                {notification.username
                                    ?.charAt(0)
                                    ?.toUpperCase() || "O"}
                            </AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">
                            {notification.message}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
}
