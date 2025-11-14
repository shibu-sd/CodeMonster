import { Skeleton } from "@/components/ui/skeleton";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { DotPattern } from "@/components/ui/dot-pattern";

export function DashboardSkeleton() {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <div className="flex-1 container mx-auto px-4 pt-32 pb-8 max-w-7xl relative z-10">
                <div className="mb-8">
                    <div className="flex items-center gap-4 mb-4">
                        <Skeleton className="w-20 h-20 rounded-full" />
                        <div className="flex-1">
                            <Skeleton className="h-9 w-64 mb-2" />
                            <Skeleton className="h-5 w-48" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-muted/20 rounded-xl p-6 border shadow-lg text-center"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <Skeleton className="h-4 w-32" />
                                <Skeleton className="h-9 w-9 rounded-lg" />
                            </div>
                            <Skeleton className="h-9 w-16 mx-auto" />
                        </div>
                    ))}
                </div>

                <div className="space-y-6">
                    <div className="bg-card rounded-xl border shadow-lg p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center">
                                <Skeleton className="h-9 w-9 rounded-lg mr-3" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <div className="flex gap-2">
                                <Skeleton className="h-10 w-20 rounded-lg" />
                                <Skeleton className="h-10 w-20 rounded-lg" />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-40 w-full rounded-lg" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-[3fr_7fr] gap-6">
                        <div className="bg-card rounded-xl border shadow-lg p-6 flex flex-col h-[500px]">
                            <div className="flex items-center mb-4">
                                <Skeleton className="h-9 w-9 rounded-lg mr-3" />
                                <Skeleton className="h-6 w-48" />
                            </div>
                            <div className="flex-1 flex flex-col items-center justify-center relative">
                                <div className="relative mb-4">
                                    <Skeleton className="h-[220px] w-[220px] rounded-full" />
                                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                                        <Skeleton className="h-10 w-16 mx-auto mb-2" />
                                        <Skeleton className="h-4 w-20" />
                                    </div>
                                </div>
                                <div className="flex gap-6">
                                    {[...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="flex items-center gap-2"
                                        >
                                            <Skeleton className="h-3 w-3 rounded-full" />
                                            <Skeleton className="h-4 w-16" />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="bg-card rounded-xl border shadow-lg p-6 flex flex-col h-[500px]">
                            <div className="flex items-center mb-6">
                                <Skeleton className="h-9 w-9 rounded-lg mr-3" />
                                <Skeleton className="h-6 w-40" />
                            </div>
                            <div className="space-y-2 flex-1 min-h-0 overflow-y-auto pr-2">
                                {[...Array(5)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-3 rounded-lg border bg-muted/20"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-1.5 mb-1.5">
                                                    <Skeleton className="h-4 w-48" />
                                                    <Skeleton className="h-4 w-12 rounded-full" />
                                                    <Skeleton className="h-4 w-16 rounded-full" />
                                                </div>
                                                <div className="flex items-center gap-3">
                                                    <Skeleton className="h-3 w-16" />
                                                    <Skeleton className="h-3 w-12" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </div>
                                            <Skeleton className="h-4 w-4" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <FooterSection />
        </div>
    );
}
