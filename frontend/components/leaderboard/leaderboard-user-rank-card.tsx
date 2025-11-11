import { Trophy } from "lucide-react";

interface LeaderboardUserRankCardProps {
    rank: number;
}

export function LeaderboardUserRankCard({
    rank,
}: LeaderboardUserRankCardProps) {
    return (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/30 shadow-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-semibold text-sm uppercase tracking-wide text-primary mb-2">
                        Your Rank
                    </h3>
                    <p className="text-4xl font-bold text-primary">#{rank}</p>
                </div>
                <div className="p-3 bg-primary/20 rounded-lg">
                    <Trophy className="w-8 h-8 text-primary" />
                </div>
            </div>
        </div>
    );
}
