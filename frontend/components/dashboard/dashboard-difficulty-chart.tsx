import { BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface DifficultyBreakdown {
    easy: number;
    medium: number;
    hard: number;
}

interface DashboardDifficultyChartProps {
    difficultyBreakdown: DifficultyBreakdown;
    totalSolved: number;
}

const COLORS = {
    easy: "#22c55e",
    medium: "#eab308",
    hard: "#ef4444",
};

export function DashboardDifficultyChart({
    difficultyBreakdown,
    totalSolved,
}: DashboardDifficultyChartProps) {
    const chartData = [
        { name: "Easy", value: difficultyBreakdown.easy, color: COLORS.easy },
        {
            name: "Medium",
            value: difficultyBreakdown.medium,
            color: COLORS.medium,
        },
        { name: "Hard", value: difficultyBreakdown.hard, color: COLORS.hard },
    ];

    return (
        <div className="bg-card rounded-xl border shadow-lg p-6 flex flex-col h-[500px]">
            <div className="flex items-center mb-4">
                <div className="p-2 bg-primary/10 rounded-lg mr-3">
                    <BarChart3 className="h-5 w-5 text-primary" />
                </div>
                <h2 className="text-xl font-bold">Difficulty Breakdown</h2>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center relative">
                <div className="relative mb-4">
                    <ResponsiveContainer width={220} height={220}>
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={2}
                                dataKey="value"
                            >
                                {chartData.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={entry.color}
                                    />
                                ))}
                            </Pie>
                            <Legend
                                verticalAlign="bottom"
                                height={36}
                                content={() => null}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                        <div className="text-4xl font-bold text-foreground">
                            {totalSolved}
                        </div>
                        <div className="text-sm text-muted-foreground">
                            Total
                        </div>
                    </div>
                </div>
                <div className="flex gap-6">
                    <div className="flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS.easy }}
                        ></div>
                        <span className="text-sm font-medium text-foreground">
                            Easy: {difficultyBreakdown.easy}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS.medium }}
                        ></div>
                        <span className="text-sm font-medium text-foreground">
                            Medium: {difficultyBreakdown.medium}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: COLORS.hard }}
                        ></div>
                        <span className="text-sm font-medium text-foreground">
                            Hard: {difficultyBreakdown.hard}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
