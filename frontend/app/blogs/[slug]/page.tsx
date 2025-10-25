"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedPage } from "@/components/auth/protected-page";
import { BlogHeader } from "@/components/blog/blog-header";
import { MarkdownRenderer } from "@/components/blog/markdown-renderer";
import { BlogSidebar } from "@/components/blog/blog-sidebar";
import { getBlogPost, getAllBlogPosts, getAllTags } from "@/lib/blog";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Clock, User } from "lucide-react";
import Link from "next/link";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { ScrollProgress } from "@/components/ui/scroll-progress";
import { Skeleton } from "@/components/ui/skeleton";

export default function BlogPostPage() {
    const params = useParams();
    const router = useRouter();
    const slug = params.slug as string;

    const [blogPost, setBlogPost] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showSkeleton, setShowSkeleton] = useState(true);
    const skeletonStartTime = useRef<number>(Date.now());

    // Get sidebar data
    const [allPosts, setAllPosts] = useState<any[]>([]);
    const [featuredPosts, setFeaturedPosts] = useState<any[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);

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

    useEffect(() => {
        async function loadData() {
            try {
                // Load the specific blog post
                const post = getBlogPost(slug);
                if (!post) {
                    setError("Blog post not found");
                    setLoading(false);
                    return;
                }

                setBlogPost(post);

                // Load sidebar data
                const posts = getAllBlogPosts();
                const featured = posts.filter((p: any) => p.featured);
                const tags = getAllTags();

                setAllPosts(posts);
                setFeaturedPosts(featured);
                setAllTags(tags);
            } catch (err) {
                console.error("Error loading blog post:", err);
                setError("Failed to load blog post");
            } finally {
                setLoading(false);
            }
        }

        if (slug) {
            loadData();
        }
    }, [slug]);

    // Get navigation posts
    const getCurrentPostIndex = () => {
        return allPosts.findIndex((post) => post.slug === slug);
    };

    const getPreviousPost = () => {
        const currentIndex = getCurrentPostIndex();
        if (currentIndex < allPosts.length - 1) {
            return allPosts[currentIndex + 1];
        }
        return null;
    };

    const getNextPost = () => {
        const currentIndex = getCurrentPostIndex();
        if (currentIndex > 0) {
            return allPosts[currentIndex - 1];
        }
        return null;
    };

    // Related posts (excluding current post)
    const getRelatedPosts = () => {
        if (!blogPost) return [];

        const currentPost = blogPost;
        const otherPosts = allPosts.filter((post) => post.slug !== slug);

        // Score posts based on shared tags and similarity
        const scoredPosts = otherPosts.map((post) => {
            let score = 0;

            // Boost score for shared tags
            const sharedTags = post.tags.filter((tag: string) =>
                currentPost.tags.includes(tag)
            );
            score += sharedTags.length * 10;

            // Boost score for same category (first tag)
            if (post.tags[0] === currentPost.tags[0]) {
                score += 5;
            }

            // Small boost for same author
            if (post.author === currentPost.author) {
                score += 2;
            }

            return { post, score };
        });

        // Sort by score and return top posts
        return scoredPosts
            .sort((a, b) => b.score - a.score)
            .slice(0, 3)
            .map((item) => item.post);
    };

    if (showSkeleton) {
        return (
            <ProtectedPage>
                <div className="min-h-screen bg-background">
                    <HeroHeader />
                    <ScrollProgress />
                    <main className="container mx-auto px-4 pt-32 pb-16">
                        {/* Back Button Skeleton */}
                        <div className="mb-6">
                            <Skeleton className="h-10 w-24" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Main Content Skeleton */}
                            <div className="lg:col-span-3">
                                {/* Blog Header Skeleton */}
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

                                {/* Blog Content Skeleton */}
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

                                {/* Navigation Skeleton */}
                                <div className="mt-12 pt-8 border-t">
                                    <div className="flex justify-between items-center">
                                        <Skeleton className="h-10 w-32" />
                                        <Skeleton className="h-10 w-32" />
                                    </div>
                                </div>

                                {/* Related Posts Skeleton */}
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

                            {/* Sidebar Skeleton */}
                            <div className="lg:col-span-1">
                                <div className="space-y-6">
                                    {/* Featured Posts Sidebar */}
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

                                    {/* Recent Posts Sidebar */}
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

                                    {/* Popular Tags Sidebar */}
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
            </ProtectedPage>
        );
    }

    if (error || !blogPost) {
        return (
            <ProtectedPage>
                <div className="min-h-screen bg-background">
                    <HeroHeader />
                    <ScrollProgress />
                    <main className="container mx-auto px-4 pt-32 pb-16">
                        <div className="text-center py-12">
                            <h1 className="text-2xl font-bold mb-4">
                                Blog Post Not Found
                            </h1>
                            <p className="text-muted-foreground mb-6">
                                The blog post you're looking for doesn't exist
                                or has been moved.
                            </p>
                            <Button asChild>
                                <Link href="/blogs">
                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                    Back to Blogs
                                </Link>
                            </Button>
                        </div>
                    </main>
                    <FooterSection />
                </div>
            </ProtectedPage>
        );
    }

    const previousPost = getPreviousPost();
    const nextPost = getNextPost();
    const relatedPosts = getRelatedPosts();

    return (
        <ProtectedPage>
            <div className="min-h-screen bg-background">
                <HeroHeader />
                <ScrollProgress />
                <main className="container mx-auto px-4 pt-32 pb-16">
                    {/* Back Button */}
                    <div className="mb-6">
                        <Button variant="ghost" asChild>
                            <Link href="/blogs">
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back to Blogs
                            </Link>
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                        {/* Main Content */}
                        <div className="lg:col-span-3">
                            {/* Blog Header */}
                            <BlogHeader {...blogPost} />

                            {/* Blog Content */}
                            <article className="prose prose-slate max-w-none">
                                <MarkdownRenderer content={blogPost.content} />
                            </article>

                            {/* Post Navigation */}
                            <div className="mt-12 pt-8 border-t">
                                <div className="flex justify-between items-center">
                                    <div>
                                        {previousPost && (
                                            <Button variant="outline" asChild>
                                                <Link
                                                    href={`/blogs/${previousPost.slug}`}
                                                >
                                                    <ArrowLeft className="h-4 w-4 mr-2" />
                                                    {previousPost.title}
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                    <div>
                                        {nextPost && (
                                            <Button variant="outline" asChild>
                                                <Link
                                                    href={`/blogs/${nextPost.slug}`}
                                                >
                                                    {nextPost.title}
                                                    <ArrowRight className="h-4 w-4 ml-2" />
                                                </Link>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Related Posts */}
                            {relatedPosts.length > 0 && (
                                <div className="mt-16 pt-8 border-t">
                                    <h3 className="text-xl font-semibold mb-6">
                                        Related Posts
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {relatedPosts.map((post) => (
                                            <div
                                                key={post.slug}
                                                className="p-4 border rounded-lg hover:shadow-md transition-shadow"
                                            >
                                                <Link
                                                    href={`/blogs/${post.slug}`}
                                                    className="block"
                                                >
                                                    <h4 className="font-medium mb-2 line-clamp-2 hover:text-primary transition-colors">
                                                        {post.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <User className="h-3 w-3" />
                                                            <span>
                                                                {post.author}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-1">
                                                            <Clock className="h-3 w-3" />
                                                            <span>
                                                                {post.readTime}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            </div>
                                        ))}
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
        </ProtectedPage>
    );
}
