import { Skeleton } from "@/components/ui/skeleton";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { DotPattern } from "@/components/ui/dot-pattern";

export function LeaderboardSkeleton() {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />

            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="space-y-8">
                    <div className="mb-8">
                        <div className="text-center space-y-4">
                            <div className="flex justify-center items-center">
                                <Skeleton className="h-10 w-48" />
                            </div>
                            <Skeleton className="h-6 w-96 mx-auto" />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div
                                key={i}
                                className="bg-muted/20 rounded-xl p-6 border shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                </div>
                                <Skeleton className="h-9 w-16 mx-auto" />
                            </div>
                        ))}
                    </div>

                    <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-r from-muted/80 to-muted/60">
                                    <tr>
                                        <th className="text-left py-4 px-6">
                                            <Skeleton className="h-4 w-12" />
                                        </th>
                                        <th
                                            className="text-left py-4 px-6"
                                            colSpan={2}
                                        >
                                            <Skeleton className="h-4 w-16" />
                                        </th>
                                        <th className="text-center py-4 px-6">
                                            <Skeleton className="h-4 w-16 mx-auto" />
                                        </th>
                                        <th className="text-center py-4 px-6">
                                            <Skeleton className="h-4 w-24 mx-auto" />
                                        </th>
                                        <th className="text-center py-4 px-6">
                                            <Skeleton className="h-4 w-24 mx-auto" />
                                        </th>
                                        <th className="text-center py-4 px-6">
                                            <Skeleton className="h-4 w-20 mx-auto" />
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                                        <tr
                                            key={i}
                                            className="border-t border-border/50"
                                        >
                                            <td className="py-5 px-6">
                                                <Skeleton className="h-8 w-8 rounded-full" />
                                            </td>
                                            <td className="py-5 px-4">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                            </td>
                                            <td className="py-5 px-2">
                                                <div className="space-y-1">
                                                    <Skeleton className="h-4 w-32" />
                                                    <Skeleton className="h-3 w-20" />
                                                </div>
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <Skeleton className="h-6 w-12 mx-auto" />
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <Skeleton className="h-6 w-12 mx-auto" />
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <Skeleton className="h-4 w-16 mx-auto" />
                                            </td>
                                            <td className="py-5 px-6 text-center">
                                                <Skeleton className="h-4 w-12 mx-auto" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="flex justify-center space-x-2">
                        <Skeleton className="h-10 w-24" />
                        <Skeleton className="h-8 w-32" />
                        <Skeleton className="h-10 w-16" />
                    </div>
                </div>
            </main>

            <FooterSection />
        </div>
    );
}
