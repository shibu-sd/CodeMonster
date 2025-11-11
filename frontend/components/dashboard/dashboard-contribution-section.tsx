"use client";

import { useState } from "react";
import { Calendar, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    ContributionData,
    ContributionGraph,
} from "@/components/ui/ContributionGraph";

interface DashboardContributionSectionProps {
    initialData: ContributionData[];
    initialYear: number;
    onYearChange: (year: number) => Promise<void>;
    loading: boolean;
}

export function DashboardContributionSection({
    initialData,
    initialYear,
    onYearChange,
    loading,
}: DashboardContributionSectionProps) {
    const [year, setYear] = useState(initialYear);
    const currentYear = new Date().getFullYear();

    const handleYearChange = async (newYear: number) => {
        setYear(newYear);
        await onYearChange(newYear);
    };

    return (
        <div className="bg-card rounded-xl border shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                    <div className="p-2 bg-primary/10 rounded-lg mr-3">
                        <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold">Contribution Activity</h2>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleYearChange(year - 1)}
                        disabled={loading}
                    >
                        {year - 1}
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleYearChange(currentYear)}
                        disabled={loading || year === currentYear}
                    >
                        {loading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            currentYear
                        )}
                    </Button>
                </div>
            </div>
            <div className="space-y-4">
                <ContributionGraph data={initialData} year={year} />
            </div>
        </div>
    );
}
