import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/ui/dot-pattern";

export function ProblemsListSkeleton() {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />

            <HeroHeader />
            <div className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="mb-8 text-center">
                    <Skeleton className="h-12 w-48 mb-4 mx-auto" />
                    <Skeleton className="h-6 w-96 mb-6 mx-auto" />
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                        {[...Array(4)].map((_, i) => (
                            <div
                                key={i}
                                className="bg-muted/20 rounded-xl p-6 border shadow-lg"
                            >
                                <div className="flex items-center justify-between mb-3">
                                    <Skeleton className="h-4 w-16" />
                                    <Skeleton className="h-9 w-9 rounded-lg" />
                                </div>
                                <Skeleton className="h-9 w-16 mx-auto" />
                            </div>
                        ))}
                    </div>
                    <div className="flex flex-col md:flex-row gap-4 mb-6">
                        <div className="flex-1">
                            <Skeleton className="h-10 w-full rounded-md" />
                        </div>
                        <div className="flex gap-2">
                            <Skeleton className="h-10 w-20 rounded-full" />
                            <Skeleton className="h-10 w-24 rounded-full" />
                            <Skeleton className="h-10 w-20 rounded-full" />
                        </div>
                    </div>
                </div>
                <div className="bg-card rounded-xl border shadow-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-muted/80 to-muted/60">
                                <tr>
                                    <th className="text-left py-4 px-6">
                                        <Skeleton className="h-4 w-20" />
                                    </th>
                                    <th className="text-center py-4 px-6">
                                        <Skeleton className="h-4 w-20 mx-auto" />
                                    </th>
                                    <th className="text-center py-4 px-6">
                                        <Skeleton className="h-4 w-24 mx-auto" />
                                    </th>
                                    <th className="text-center py-4 px-6">
                                        <Skeleton className="h-4 w-24 mx-auto" />
                                    </th>
                                    <th className="text-center py-4 px-6">
                                        <Skeleton className="h-4 w-16 mx-auto" />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {[...Array(10)].map((_, index) => (
                                    <tr
                                        key={index}
                                        className="border-t border-border/50"
                                    >
                                        <td className="py-5 px-6">
                                            <div className="flex items-center space-x-3">
                                                <Skeleton className="h-4 w-8" />
                                                <Skeleton className="h-5 w-64" />
                                            </div>
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <Skeleton className="h-6 w-16 mx-auto rounded-full" />
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <Skeleton className="h-4 w-12 mx-auto" />
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <Skeleton className="h-4 w-16 mx-auto" />
                                        </td>
                                        <td className="py-5 px-6 text-center">
                                            <Skeleton className="h-5 w-5 mx-auto rounded-full" />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="flex justify-center items-center space-x-2 mt-8">
                    <Skeleton className="h-10 w-20" />
                    <div className="flex space-x-1">
                        {[...Array(5)].map((_, i) => (
                            <Skeleton key={i} className="h-10 w-10" />
                        ))}
                    </div>
                    <Skeleton className="h-10 w-12" />
                </div>
            </div>
            <FooterSection />
        </div>
    );
}
