"use client";

import { BlogCard } from "@/components/blog/blog-card";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { getAllBlogPosts, getFeaturedBlogPosts, getAllTags } from "@/lib/blog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Filter } from "lucide-react";
import { useState, useMemo, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { DotPattern } from "@/components/ui/dot-pattern";
import { BlogsListSkeleton } from "@/components/skeletons/blogs/blogs-list-skeleton";
import type { BlogPost } from "@/types";

function BlogsPageContent() {
    const searchParams = useSearchParams();
    const tagFromUrl = searchParams.get("tag");

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTag, setSelectedTag] = useState<string | null>(tagFromUrl);
    const [loading, setLoading] = useState(true);

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

    // Simulate data loading
    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    const filteredPosts = useMemo(() => {
        let filtered: BlogPost[] = allPosts;

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

        if (selectedTag) {
            filtered = filtered.filter((post) =>
                post.tags.some(
                    (tag) => tag.toLowerCase() === selectedTag.toLowerCase()
                )
            );
        }

        return filtered;
    }, [allPosts, searchQuery, selectedTag]);

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

    if (loading) {
        return <BlogsListSkeleton />;
    }

    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="text-center mb-10">
                    <div className="flex items-center justify-center gap-3 mb-4">
                        <h1 className="text-4xl font-bold">Blogs</h1>
                    </div>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        Every post pushes you closer to your monster potential
                    </p>
                </div>

                <div className="mb-8 space-y-4">
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search blog posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

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
                    <div className="lg:col-span-3 space-y-8">
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

export default function BlogsPage() {
    return (
        <Suspense fallback={<BlogsListSkeleton />}>
            <BlogsPageContent />
        </Suspense>
    );
}
