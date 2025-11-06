import Link from "next/link";
import { ArrowLeft, Swords, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Problem } from "@/lib/api";
import {
    getDifficultyBadgeColor,
    formatAcceptanceRate,
    formatSubmissionCount,
} from "@/lib/api";
import { BattleTimer } from "@/components/battle/BattleTimer";

interface BattleInfo {
    id: string;
    opponent?: {
        id: string;
        username?: string;
        profileImageUrl?: string;
    };
    timeLimit: number;
    status: string;
    startTime?: Date;
}

interface ProblemHeaderProps {
    problem: Problem;
    battleInfo?: BattleInfo;
    onExitBattle?: () => void;
}

export function ProblemHeader({
    problem,
    battleInfo,
    onExitBattle,
}: ProblemHeaderProps) {
    return (
        <div className="mb-3 px-2">
            {/* Regular Navigation */}
            <div className="flex items-center mb-4">
                <Link href={battleInfo ? "/battle" : "/problems"}>
                    <Button variant="ghost" size="sm">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        {battleInfo
                            ? "Back to Battle Lobby"
                            : "Back to Problems"}
                    </Button>
                </Link>
            </div>

            {/* Problem Title with Battle Info */}
            <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                    <h1 className="text-3xl font-bold">{problem.title}</h1>

                    {/* Battle Mode Info - Inline on Right */}
                    {battleInfo &&
                        (battleInfo.status === "active" ||
                            battleInfo.status === "waiting") && (
                            <div className="flex items-center gap-3">
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-orange-50 dark:bg-orange-950 border-2 border-orange-400 dark:border-orange-600 rounded-lg">
                                    <Swords className="w-4 h-4 text-orange-600 dark:text-orange-400 animate-pulse" />
                                    <span className="font-bold text-sm text-orange-600 dark:text-orange-400">
                                        BATTLE
                                    </span>
                                </div>

                                {battleInfo.opponent && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-300 dark:border-blue-700 rounded-lg">
                                        <Avatar className="h-5 w-5">
                                            <AvatarImage
                                                src={
                                                    battleInfo.opponent
                                                        .profileImageUrl
                                                }
                                            />
                                            <AvatarFallback className="text-xs bg-blue-200 dark:bg-blue-800">
                                                {battleInfo.opponent.username
                                                    ?.charAt(0)
                                                    ?.toUpperCase() || "O"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm font-semibold">
                                            vs{" "}
                                            {battleInfo.opponent.username ||
                                                "Anonymous"}
                                        </span>
                                    </div>
                                )}

                                {/* Timer */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-950 border border-green-300 dark:border-green-700 rounded-lg">
                                    <BattleTimer
                                        startTime={battleInfo.startTime || null}
                                        timeLimit={battleInfo.timeLimit}
                                        onTimeUp={() => onExitBattle?.()}
                                    />
                                </div>

                                {/* Exit Button */}
                                {onExitBattle && (
                                    <Button
                                        onClick={onExitBattle}
                                        variant="destructive"
                                        size="sm"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        )}
                </div>

                <div className="flex flex-col space-y-3">
                    <div className="flex items-center space-x-4">
                        <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getDifficultyBadgeColor(
                                problem.difficulty
                            )}`}
                        >
                            {problem.difficulty}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Acceptance Rate:{" "}
                            {formatAcceptanceRate(problem?.acceptanceRate)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                            Submissions:{" "}
                            {formatSubmissionCount(problem?.totalSubmissions)}
                        </span>
                    </div>

                    {/* Tags */}
                    {problem.tags && problem.tags.length > 0 && (
                        <div className="flex items-center space-x-2">
                            {problem.tags.map((tag, index) => (
                                <span
                                    key={index}
                                    className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-muted text-muted-foreground hover:bg-muted/80 transition-colors"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
