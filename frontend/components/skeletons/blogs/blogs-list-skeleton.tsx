import { Skeleton } from "@/components/ui/skeleton";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { DotPattern } from "@/components/ui/dot-pattern";

export function BlogsListSkeleton() {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <Skeleton className="h-12 w-32" />
                    </div>
                    <Skeleton className="h-6 w-96 mb-6 mx-auto" />
                </div>

                <div className="mb-8 space-y-4">
                    <div className="relative max-w-md mx-auto">
                        <Skeleton className="h-10 w-full rounded-md" />
                    </div>

                    <div className="flex flex-wrap justify-center gap-2">
                        {[...Array(6)].map((_, i) => (
                            <Skeleton
                                key={i}
                                className="h-6 w-16 rounded-full"
                            />
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3 space-y-8">
                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Skeleton className="h-6 w-6" />
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(2)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-card rounded-lg border p-4 space-y-3"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Skeleton className="h-5 w-24" />
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                        </div>
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-4 w-24" />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-12" />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                            <Skeleton className="h-5 w-20 rounded-full" />
                                            <Skeleton className="h-5 w-14 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Skeleton className="h-6 w-32" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[...Array(4)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="bg-card rounded-lg border p-4 space-y-3"
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <Skeleton className="h-5 w-32" />
                                        </div>
                                        <Skeleton className="h-4 w-full mb-2" />
                                        <div className="space-y-2">
                                            <Skeleton className="h-4 w-36" />
                                            <Skeleton className="h-4 w-28" />
                                            <Skeleton className="h-4 w-20" />
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-12" />
                                            </div>
                                        </div>
                                        <div className="flex flex-wrap gap-1">
                                            <Skeleton className="h-5 w-20 rounded-full" />
                                            <Skeleton className="h-5 w-16 rounded-full" />
                                            <Skeleton className="h-5 w-24 rounded-full" />
                                            <Skeleton className="h-5 w-14 rounded-full" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-1">
                        <div className="space-y-6">
                            <div className="bg-card rounded-lg border p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-5 w-28" />
                                </div>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-20" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-card rounded-lg border p-4 space-y-4">
                                <div className="flex items-center gap-2">
                                    <Skeleton className="h-5 w-5" />
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-28" />
                                        <div className="flex items-center gap-1">
                                            <Skeleton className="h-3 w-3" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-card rounded-lg border p-4 space-y-4">
                                <Skeleton className="h-5 w-24 mb-4" />
                                <div className="flex flex-wrap gap-2">
                                    {[...Array(8)].map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-5 w-16 rounded-full"
                                        />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <FooterSection />
        </div>
    );
}
