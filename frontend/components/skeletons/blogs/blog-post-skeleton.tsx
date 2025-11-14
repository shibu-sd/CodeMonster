import { Skeleton } from "@/components/ui/skeleton";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { DotPattern } from "@/components/ui/dot-pattern";

export function BlogPostSkeleton() {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <ScrollProgress />
            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="mb-6">
                    <Skeleton className="h-10 w-24" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <div className="space-y-4 mb-8 pb-8 border-b">
                            <div className="flex items-center gap-2 mb-2">
                                <Skeleton className="h-6 w-24 rounded-full" />
                            </div>
                            <Skeleton className="h-12 w-3/4 mb-4" />
                            <Skeleton className="h-6 w-full mb-4" />
                            <div className="flex flex-wrap gap-2">
                                <Skeleton className="h-5 w-20 rounded-full" />
                                <Skeleton className="h-5 w-24 rounded-full" />
                                <Skeleton className="h-5 w-28 rounded-full" />
                                <Skeleton className="h-5 w-16 rounded-full" />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-11/12" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-5/6" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-4/5" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-3/4" />
                        </div>

                        <div className="mt-12 pt-8 border-t">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-10 w-32" />
                                <Skeleton className="h-10 w-32" />
                            </div>
                        </div>

                        <div className="mt-16 pt-8 border-t">
                            <Skeleton className="h-6 w-40 mb-6" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {[...Array(3)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="p-4 border rounded-lg space-y-2"
                                    >
                                        <Skeleton className="h-4 w-32" />
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-16" />
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Skeleton className="h-3 w-3" />
                                                <Skeleton className="h-3 w-12" />
                                            </div>
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
                                    <Skeleton className="h-5 w-32" />
                                </div>
                                {[...Array(3)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-36" />
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
                                    <Skeleton className="h-5 w-28" />
                                </div>
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="space-y-2">
                                        <Skeleton className="h-4 w-32" />
                                        <div className="flex items-center gap-1">
                                            <Skeleton className="h-3 w-3" />
                                            <Skeleton className="h-3 w-20" />
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="bg-card rounded-lg border p-4 space-y-4">
                                <Skeleton className="h-5 w-32 mb-4" />
                                <div className="flex flex-wrap gap-2">
                                    {[...Array(8)].map((_, i) => (
                                        <Skeleton
                                            key={i}
                                            className="h-5 w-20 rounded-full"
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
