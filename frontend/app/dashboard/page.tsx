"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useApiWithAuth } from "@/lib/api";
import { useAuth } from "@clerk/nextjs";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { ContributionData } from "@/components/ui/ContributionGraph";
import { DotPattern } from "@/components/ui/dot-pattern";
import { DashboardSkeleton } from "@/components/skeletons/dashboard/dashboard-skeleton";
import { DashboardStatsCards } from "@/components/dashboard/dashboard-stats-cards";
import { DashboardErrorState } from "@/components/dashboard/dashboard-error-state";
import { DashboardContributionSection } from "@/components/dashboard/dashboard-contribution-section";
import { DashboardRecentSubmissions } from "@/components/dashboard/dashboard-recent-submissions";
import type { DashboardData } from "@/types";

// Lazy load Recharts
const DashboardDifficultyChart = dynamic(
    () =>
        import("@/components/dashboard/dashboard-difficulty-chart").then(
            (mod) => mod.DashboardDifficultyChart
        ),
    {
        ssr: false,
        loading: () => (
            <div className="bg-card rounded-xl border shadow-lg p-6 flex items-center justify-center h-[500px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">
                        Loading chart...
                    </p>
                </div>
            </div>
        ),
    }
);

function DashboardPageContent() {
    const router = useRouter();
    const api = useApiWithAuth();
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState<DashboardData | null>(
        null
    );
    const [error, setError] = useState<string | null>(null);
    const [contributionData, setContributionData] = useState<
        ContributionData[]
    >([]);
    const [contributionYear, setContributionYear] = useState(
        new Date().getFullYear()
    );
    const [loadingContribution, setLoadingContribution] = useState(false);

    // Set page title
    useEffect(() => {
        document.title = "Dashboard - CodeMonster";
    }, []);

    useEffect(() => {
        const initDashboard = async () => {
            if (isLoaded && isSignedIn) {
                try {
                    const token = await getToken();
                    if (token) {
                        api.setAuthToken(token);
                        await Promise.all([
                            loadDashboard(),
                            loadContributionData(),
                        ]);
                    }
                } catch (err) {
                    console.error("Failed to get token:", err);
                    setError("Authentication failed");
                    setLoading(false);
                }
            } else if (isLoaded && !isSignedIn) {
                router.push("/auth/sign-in");
            }
        };

        initDashboard();
    }, [isLoaded, isSignedIn]);

    const loadDashboard = async () => {
        try {
            setLoading(true);

            const token = await getToken();
            if (token) {
                api.setAuthToken(token);
            }

            const response = await api.getUserDashboard();

            if (response.success && response.data) {
                setDashboardData(response.data);
            } else {
                setError("Failed to load dashboard data");
            }
        } catch (err) {
            console.error("Error loading dashboard:", err);
            setError("Failed to load dashboard");
        } finally {
            setLoading(false);
        }
    };

    const loadContributionData = async (year: number = contributionYear) => {
        try {
            setLoadingContribution(true);
            const response = await api.getUserContributionData(year);

            if (response.success && response.data) {
                setContributionData(response.data);
                setContributionYear(year);
            } else {
                console.error("Failed to load contribution data");
            }
        } catch (err) {
            console.error("Error loading contribution data:", err);
        } finally {
            setLoadingContribution(false);
        }
    };

    if (loading) {
        return <DashboardSkeleton />;
    }

    if (error || !dashboardData) {
        return (
            <DashboardErrorState error={error || ""} onRetry={loadDashboard} />
        );
    }

    const { user, solvedProblems, recentSubmissions, stats } = dashboardData;
    const { difficultyBreakdown, topTags } = stats;

    return (
        <div className="min-h-screen flex flex-col relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <div className="flex-1 container mx-auto px-4 pt-32 pb-8 max-w-7xl relative z-10">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        {user.profileImageUrl && (
                            <img
                                src={user.profileImageUrl}
                                alt={user.username || "User"}
                                className="w-20 h-20 rounded-full border-4 border-primary"
                            />
                        )}
                        <div>
                            <h1 className="text-3xl font-bold">
                                {user.firstName || user.username || "User"}
                                's Dashboard
                            </h1>
                            <p className="text-muted-foreground">
                                @{user.username || "user"} • Member since{" "}
                                {new Date(user.createdAt).toLocaleDateString()}
                            </p>
                        </div>
                    </div>
                </div>

                <DashboardStatsCards
                    problemsSolved={user.problemsSolved}
                    totalSubmissions={user.totalSubmissions}
                    acceptanceRate={user.acceptanceRate}
                    battlesWon={user.battlesWon}
                />

                <div className="space-y-6">
                    <DashboardContributionSection
                        initialData={contributionData}
                        initialYear={contributionYear}
                        onYearChange={loadContributionData}
                        loading={loadingContribution}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-6">
                        <DashboardDifficultyChart
                            difficultyBreakdown={difficultyBreakdown}
                            totalSolved={user.problemsSolved}
                        />
                        <DashboardRecentSubmissions
                            recentSubmissions={recentSubmissions}
                        />
                    </div>
                </div>
            </div>
            <FooterSection />
        </div>
    );
}

export default function DashboardPage() {
    return <DashboardPageContent />;
}
