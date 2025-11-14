import { Target, Code, TrendingUp, Swords } from "lucide-react";
import { memo } from "react";

interface DashboardStatsCardsProps {
    problemsSolved: number;
    totalSubmissions: number;
    acceptanceRate: number;
    battlesWon: number;
}

export const DashboardStatsCards = memo(function DashboardStatsCards({
    problemsSolved,
    totalSubmissions,
    acceptanceRate,
    battlesWon,
}: DashboardStatsCardsProps) {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-lg text-center">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                        Problems Solved
                    </span>
                    <div className="p-2 bg-green-200 dark:bg-green-800/50 rounded-lg">
                        <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {problemsSolved}
                </p>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-lg text-center">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                        Total Submissions
                    </span>
                    <div className="p-2 bg-blue-200 dark:bg-blue-800/50 rounded-lg">
                        <Code className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {totalSubmissions}
                </p>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/30 dark:to-purple-900/20 rounded-xl p-6 border border-purple-200 dark:border-purple-800 shadow-lg text-center">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wide">
                        Acceptance Rate
                    </span>
                    <div className="p-2 bg-purple-200 dark:bg-purple-800/50 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-purple-700 dark:text-purple-300">
                    {acceptanceRate.toFixed(1)}%
                </p>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/30 dark:to-orange-900/20 rounded-xl p-6 border border-orange-200 dark:border-orange-800 shadow-lg text-center">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-orange-700 dark:text-orange-400 uppercase tracking-wide">
                        Battles Won
                    </span>
                    <div className="p-2 bg-orange-200 dark:bg-orange-800/50 rounded-lg">
                        <Swords className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-300">
                    {battlesWon}
                </p>
            </div>
        </div>
    );
});
