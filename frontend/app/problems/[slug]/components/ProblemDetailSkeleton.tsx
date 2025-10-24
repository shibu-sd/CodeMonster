import { Skeleton } from "@/components/ui/skeleton";

export function ProblemDetailSkeleton() {
    return (
        <div className="h-screen bg-background flex flex-col overflow-hidden">
            {/* Header Skeleton - Properly Aligned */}
            <div className="mb-3 px-2">
                {/* Back Button */}
                <div className="flex items-center mb-4">
                    <Skeleton className="h-8 w-32" />
                </div>

                {/* Problem Title and Meta Info */}
                <div className="mb-6">
                    <Skeleton className="h-10 w-96 mb-3" />
                    <div className="flex flex-wrap items-center gap-4 mb-3">
                        <Skeleton className="h-6 w-24 rounded-full" />
                        <Skeleton className="h-5 w-32" />
                        <Skeleton className="h-5 w-28" />
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-6 w-20 rounded-md" />
                        <Skeleton className="h-6 w-24 rounded-md" />
                        <Skeleton className="h-6 w-28 rounded-md" />
                        <Skeleton className="h-6 w-22 rounded-md" />
                    </div>
                </div>
            </div>

            {/* Split Layout Skeleton */}
            <div className="flex-1 overflow-hidden flex">
                {/* Left Panel Skeleton - Problem Content */}
                <div className="w-1/2 flex flex-col h-full overflow-hidden pr-3">
                    <div className="flex flex-col h-full">
                        {/* Tabs Header Skeleton */}
                        <div className="flex justify-between items-center border-b mb-3 flex-shrink-0">
                            <div className="flex">
                                <Skeleton className="h-10 w-28 mr-1" />
                                <Skeleton className="h-10 w-24 mr-1" />
                                <Skeleton className="h-10 w-20" />
                            </div>
                            <div className="flex space-x-2">
                                <Skeleton className="h-8 w-8" />
                                <Skeleton className="h-8 w-8" />
                            </div>
                        </div>

                        {/* Tab Content Skeleton */}
                        <div className="flex-1 overflow-hidden">
                            <div className="h-full overflow-y-auto pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-[#424242] dark:[&::-webkit-scrollbar-thumb:hover]:bg-[#4f4f4f]">
                                <div className="space-y-6 pb-6">
                                    <div className="bg-card rounded-lg p-6 border">
                                        {/* Description content skeleton - more realistic */}
                                        <div className="prose prose-sm max-w-none dark:prose-invert space-y-4">
                                            {/* Problem statement */}
                                            <Skeleton className="h-5 w-full mb-2" />
                                            <Skeleton className="h-5 w-4/5 mb-4" />

                                            {/* Example section */}
                                            <Skeleton className="h-6 w-32 mb-3" />
                                            <div className="space-y-2 mb-4">
                                                <Skeleton className="h-4 w-16" />
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-3/4" />
                                            </div>

                                            {/* Output section */}
                                            <Skeleton className="h-4 w-20 mb-2" />
                                            <div className="space-y-2 mb-4">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-2/3" />
                                            </div>

                                            {/* Constraints section */}
                                            <Skeleton className="h-6 w-24 mb-3" />
                                            <div className="space-y-2 mb-4">
                                                <Skeleton className="h-4 w-full" />
                                                <Skeleton className="h-4 w-5/6" />
                                                <Skeleton className="h-4 w-4/5" />
                                            </div>

                                            {/* Code block example */}
                                            <Skeleton className="h-6 w-36 mb-3" />
                                            <div className="bg-muted p-4 rounded-md border">
                                                <div className="space-y-2 font-mono text-sm">
                                                    {[...Array(5)].map((_, i) => (
                                                        <div key={i} className="flex items-center space-x-2">
                                                            <Skeleton
                                                                className="flex-1 h-4"
                                                                style={{
                                                                    width: `${Math.random() * 30 + 50}%`
                                                                }}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Panel Skeleton - Code Editor */}
                <div className="w-1/2 flex flex-col h-full pl-3">
                    <div className="h-full flex flex-col">
                        {/* Editor Header Skeleton */}
                        <div className="flex items-center justify-between bg-card rounded-lg p-3 border flex-shrink-0">
                            <div className="flex items-center space-x-4">
                                <Skeleton className="h-4 w-20" />
                                <Skeleton className="h-8 w-28 rounded-md" />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Skeleton className="h-8 w-16 rounded" />
                                <Skeleton className="h-8 w-16 rounded" />
                                <Skeleton className="h-8 w-20 rounded" />
                            </div>
                        </div>

                        {/* Code Editor Skeleton */}
                        <div className="bg-card rounded-lg border overflow-hidden flex-1">
                            <div className="h-full">
                                {/* Monaco Editor-like skeleton */}
                                <div className="h-full font-mono text-sm p-4">
                                    <div className="space-y-1">
                                        {[...Array(25)].map((_, i) => (
                                            <div key={i} className="flex items-center">
                                                {/* Line numbers */}
                                                <span className="text-muted-foreground w-8 text-right mr-4 select-none">
                                                    {i + 1}
                                                </span>
                                                {/* Code line with realistic indentation */}
                                                <Skeleton
                                                    className="h-4"
                                                    style={{
                                                        width: `${Math.random() * 35 + 45}%`,
                                                        marginLeft: i % 3 === 0 ? '0px' : i % 3 === 1 ? '16px' : '32px'
                                                    }}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}