"use client";

import { BlogCard } from "@/components/blog/blog-card";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { getAllBlogPosts, getFeaturedBlogPosts, getAllTags } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter, BookOpen } from "lucide-react";
import { useState, useMemo, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { Skeleton } from "@/components/ui/skeleton";
import { DotPattern } from "@/components/ui/dot-pattern";

export default function BlogsPage() {
    const searchParams = useSearchParams();
    const tagFromUrl = searchParams.get("tag");

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(tagFromUrl);
    const [loading, setLoading] = useState(true);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const skeletonStartTime = useRef<number>(Date.now());

    const allPosts = useMemo(() => getAllBlogPosts(), []);
    const featuredPosts = useMemo(() => getFeaturedBlogPosts(), []);
    const allTags = useMemo(() => getAllTags(), []);

    // Set page title
    useEffect(() => {
        document.title = "Blogs - CodeMonster";
    }, []);

    // Update selectedTag when URL changes
    useEffect(() => {
        setSelectedTag(tagFromUrl);
    }, [tagFromUrl]);

    // Handle minimum skeleton display time
    useEffect(() => {
        if (!loading && showSkeleton) {
            const elapsedTime = Date.now() - skeletonStartTime.current;
            const minimumDisplayTime = 500; // 0.5 second minimum

            if (elapsedTime < minimumDisplayTime) {
                const remainingTime = minimumDisplayTime - elapsedTime;
                const timer = setTimeout(() => {
                    setShowSkeleton(false);
                }, remainingTime);

                return () => clearTimeout(timer);
            } else {
                setShowSkeleton(false);
            }
        }

        if (loading && !showSkeleton) {
            setShowSkeleton(true);
            skeletonStartTime.current = Date.now();
        }
    }, [loading, showSkeleton]);

    // Simulate data loading
    useEffect(() => {
        // Simulate loading delay for demonstration
        const timer = setTimeout(() => {
            setLoading(false);
        }, 100); // Simulate API call

        return () => clearTimeout(timer);
    }, []);

    // Filter posts based on search query and selected tag
    const filteredPosts = useMemo(() => {
        let filtered = allPosts;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    post.excerpt.toLowerCase().includes(query) ||
                    post.content.toLowerCase().includes(query) ||
                    post.tags.some((tag) => tag.toLowerCase().includes(query))
            );
        }

        // Filter by selected tag
        if (selectedTag) {
            filtered = filtered.filter((post) =>
                post.tags.some(
                    (tag) => tag.toLowerCase() === selectedTag.toLowerCase()
                )
            );
        }

        return filtered;
    }, [allPosts, searchQuery, selectedTag]);

    // Separate featured and regular posts for display
    const displayFeaturedPosts = useMemo(() => {
        return filteredPosts.filter((post) => post.featured);
    }, [filteredPosts]);

    const displayRegularPosts = useMemo(() => {
        return filteredPosts.filter((post) => !post.featured);
    }, [filteredPosts]);

    const clearFilters = () => {
        setSearchQuery("");
        setSelectedTag(null);
    };

    if (showSkeleton) {
        return (
            <div className="min-h-screen bg-background relative">
                <DotPattern className="opacity-30" />
                <HeroHeader />
                <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                    {/* Header Skeleton */}
                    <div className="text-center mb-10">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Skeleton className="h-12 w-32" />
                        </div>
                        <Skeleton className="h-6 w-96 mb-6 mx-auto" />
                    </div>

                    {/* Search and Filters Skeleton */}
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

                    {/* Content Grid Skeleton */}
                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Main Content Skeleton */}
                        <div className="lg:col-span-3 space-y-8">
                            {/* Featured Posts Skeleton */}
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

                            {/* Regular Posts Skeleton */}
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

                        {/* Sidebar Skeleton */}
                        <div className="lg:col-span-1">
                            <div className="space-y-6">
                                {/* Featured Posts Sidebar */}
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

                                {/* Recent Posts Sidebar */}
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

                                {/* Popular Tags Sidebar */}
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

    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-4xl font-bold">Blogs</h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Every post pushes you closer to your monster potential
                    </p>
                </div>

                {/* Search and Filters */}
                <div className="mb-8 space-y-4">
                    {/* Search Bar */}
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search blog posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Tag Filters */}
                    <div className="flex flex-wrap justify-center gap-2">
                        {allTags.slice(0, 12).map((tag) => (
                            <Badge
                                key={tag}
                                variant={
                                    selectedTag === tag ? "default" : "outline"
                                }
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => {
                                    const newTag =
                                        selectedTag === tag ? null : tag;
                                    setSelectedTag(newTag);
                                    // Update URL
                                    const url = new URL(window.location.href);
                                    if (newTag) {
                                        url.searchParams.set("tag", newTag);
                                    } else {
                                        url.searchParams.delete("tag");
                                    }
                                    window.history.pushState(
                                        {},
                                        "",
                                        url.toString()
                                    );
                                }}
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>

                    {/* Active Filters Display */}
                    {(searchQuery || selectedTag) && (
                        <div className="flex justify-center items-center gap-2">
                            <Filter className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                                Filters: {searchQuery && `"${searchQuery}"`}{" "}
                                {searchQuery && selectedTag && " + "}{" "}
                                {selectedTag && `"${selectedTag}"`}
                            </span>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                            >
                                Clear
                            </Button>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-3 space-y-8">
                        {/* Results Count */}
                        <div className="text-muted-foreground">
                            {filteredPosts.length === 0 ? (
                                <p>
                                    No blog posts found matching your criteria.
                                </p>
                            ) : (
                                <p>
                                    Found {filteredPosts.length} blog post
                                    {filteredPosts.length !== 1 ? "s" : ""}
                                </p>
                            )}
                        </div>

                        {/* Featured Posts */}
                        {displayFeaturedPosts.length > 0 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold flex items-center gap-2">
                                    <span className="text-primary">⭐</span>{" "}
                                    Featured Posts
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {displayFeaturedPosts.map((post) => (
                                        <BlogCard key={post.slug} {...post} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Regular Posts */}
                        {displayRegularPosts.length > 0 && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold">
                                    Recent Posts
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {displayRegularPosts.map((post) => (
                                        <BlogCard key={post.slug} {...post} />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* No Results */}
                        {filteredPosts.length === 0 && (
                            <div className="text-center py-12">
                                <div className="text-muted-foreground space-y-2">
                                    <p>
                                        No blog posts found matching your
                                        criteria.
                                    </p>
                                    <p className="text-sm">
                                        Try adjusting your search terms or
                                        filters.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <BlogSidebar
                                recentPosts={allPosts}
                                allTags={allTags}
                                featuredPosts={featuredPosts}
                            />
                        </div>
                    </div>
                </div>
            </main>
            <FooterSection />
        </div>
    );
}
