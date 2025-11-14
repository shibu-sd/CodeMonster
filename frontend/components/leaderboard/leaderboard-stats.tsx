import React from "react";
import type { LeaderboardStatsProps } from "@/types";
import { Users, Trophy, Target, TrendingUp } from "lucide-react";

export function LeaderboardStats({ stats, isLoading }: LeaderboardStatsProps) {
    if (isLoading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                    <div
                        key={i}
                        className="bg-muted/20 rounded-xl p-6 border shadow-lg"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                            <div className="h-9 w-9 bg-muted rounded-lg animate-pulse" />
                        </div>
                        <div className="h-9 w-16 bg-muted rounded animate-pulse mx-auto" />
                    </div>
                ))}
            </div>
        );
    }

    const statCards = [
        {
            title: "Total Participants",
            value: stats.totalUsers.toLocaleString(),
            icon: Users,
            gradient:
                "from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20",
            border: "border-blue-200 dark:border-blue-800",
            iconBg: "bg-blue-200 dark:bg-blue-800/50",
            iconColor: "text-blue-600 dark:text-blue-400",
            textColor: "text-blue-700 dark:text-blue-300",
            labelColor: "text-blue-700 dark:text-blue-400",
        },
        {
            title: "Problems Solved",
            value: stats.totalProblemsSolved.toLocaleString(),
            icon: Target,
            gradient:
                "from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20",
            border: "border-green-200 dark:border-green-800",
            iconBg: "bg-green-200 dark:bg-green-800/50",
            iconColor: "text-green-600 dark:text-green-400",
            textColor: "text-green-700 dark:text-green-300",
            labelColor: "text-green-700 dark:text-green-400",
        },
        {
            title: "Average Solved",
            value: stats.averageProblemsSolved.toFixed(1),
            icon: TrendingUp,
            gradient:
                "from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20",
            border: "border-purple-200 dark:border-purple-800",
            iconBg: "bg-purple-200 dark:bg-purple-800/50",
            iconColor: "text-purple-600 dark:text-purple-400",
            textColor: "text-purple-700 dark:text-purple-300",
            labelColor: "text-purple-700 dark:text-purple-400",
        },
        {
            title: "Top Score",
            value: stats.topUserProblemsSolved.toLocaleString(),
            icon: Trophy,
            gradient:
                "from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20",
            border: "border-yellow-200 dark:border-yellow-800",
            iconBg: "bg-yellow-200 dark:bg-yellow-800/50",
            iconColor: "text-yellow-600 dark:text-yellow-400",
            textColor: "text-yellow-700 dark:text-yellow-300",
            labelColor: "text-yellow-700 dark:text-yellow-400",
        },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                    <div
                        key={index}
                        className={`bg-gradient-to-br ${card.gradient} rounded-xl p-6 border ${card.border} shadow-lg text-center`}
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span
                                className={`text-sm font-semibold ${card.labelColor} uppercase tracking-wide`}
                            >
                                {card.title}
                            </span>
                            <div className={`p-2 ${card.iconBg} rounded-lg`}>
                                <Icon className={`h-5 w-5 ${card.iconColor}`} />
                            </div>
                        </div>
                        <p className={`text-3xl font-bold ${card.textColor}`}>
                            {card.value}
                        </p>
                    </div>
                );
            })}
        </div>
    );
}
