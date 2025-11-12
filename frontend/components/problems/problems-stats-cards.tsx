import { BarChart3, Star } from "lucide-react";
import { ProblemStats } from "@/lib/api";

interface ProblemsStatsCardsProps {
    stats: ProblemStats | null;
}

export function ProblemsStatsCards({ stats }: ProblemsStatsCardsProps) {
    if (!stats) return null;

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">
                        Total
                    </span>
                    <div className="p-2 bg-blue-200 dark:bg-blue-800/50 rounded-lg">
                        <BarChart3 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                    {stats.total}
                </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/20 rounded-xl p-6 border border-green-200 dark:border-green-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">
                        Easy
                    </span>
                    <div className="p-2 bg-green-200 dark:bg-green-800/50 rounded-lg">
                        <Star className="h-5 w-5 text-green-600 dark:text-green-400 fill-green-600 dark:fill-green-400" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                    {stats.easy}
                </p>
            </div>

            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950/30 dark:to-yellow-900/20 rounded-xl p-6 border border-yellow-200 dark:border-yellow-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-yellow-700 dark:text-yellow-400 uppercase tracking-wide">
                        Medium
                    </span>
                    <div className="p-2 bg-yellow-200 dark:bg-yellow-800/50 rounded-lg flex items-center">
                        <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400" />
                        <Star className="h-4 w-4 text-yellow-600 dark:text-yellow-400 fill-yellow-600 dark:fill-yellow-400 -ml-1" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-yellow-700 dark:text-yellow-300">
                    {stats.medium}
                </p>
            </div>

            <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/30 dark:to-red-900/20 rounded-xl p-6 border border-red-200 dark:border-red-800 shadow-lg">
                <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">
                        Hard
                    </span>
                    <div className="p-2 bg-red-200 dark:bg-red-800/50 rounded-lg flex items-center">
                        <Star className="h-4 w-4 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400" />
                        <Star className="h-4 w-4 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400 -ml-1" />
                        <Star className="h-4 w-4 text-red-600 dark:text-red-400 fill-red-600 dark:fill-red-400 -ml-1" />
                    </div>
                </div>
                <p className="text-3xl font-bold text-red-700 dark:text-red-300">
                    {stats.hard}
                </p>
            </div>
        </div>
    );
}
