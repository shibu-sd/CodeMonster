"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
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
import { DotPattern } from "@/components/ui/dot-pattern";
import { BlogPostSkeleton } from "@/components/skeletons/blogs/blog-post-skeleton";
import {
    getPreviousPost,
    getNextPost,
    getRelatedPosts,
} from "@/utils/blog-navigation.utils";
import type { BlogPost } from "@/types";

export default function BlogPostPage() {
    const params = useParams();
    const slug = params.slug as string;

    const [blogPost, setBlogPost] = useState<BlogPost | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [allPosts, setAllPosts] = useState<BlogPost[]>([]);
    const [featuredPosts, setFeaturedPosts] = useState<BlogPost[]>([]);
    const [allTags, setAllTags] = useState<string[]>([]);

    useEffect(() => {
        if (blogPost?.title) {
            document.title = `${blogPost.title} - CodeMonster`;
        } else {
            document.title = "Blog - CodeMonster";
        }
    }, [blogPost?.title]);

    useEffect(() => {
        async function loadData() {
            try {
                const post = getBlogPost(slug);
                if (!post) {
                    setError("Blog post not found");
                    setLoading(false);
                    return;
                }

                setBlogPost(post);

                const posts = getAllBlogPosts();
                const featured = posts.filter((p) => p.featured);
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

    if (loading) {
        return <BlogPostSkeleton />;
    }

    if (error || !blogPost) {
        return (
            <div className="min-h-screen bg-background relative">
                <DotPattern className="opacity-30" />
                <HeroHeader />
                <ScrollProgress />
                <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                    <div className="text-center py-12">
                        <h1 className="text-2xl font-bold mb-4">
                            Blog Post Not Found
                        </h1>
                        <p className="text-muted-foreground mb-6">
                            The blog post you're looking for doesn't exist or
                            has been moved.
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
        );
    }

    const previousPost = getPreviousPost(allPosts, slug);
    const nextPost = getNextPost(allPosts, slug);
    const relatedPosts = blogPost
        ? getRelatedPosts(allPosts, blogPost, slug)
        : [];

    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <ScrollProgress />
            <main className="container mx-auto px-4 pt-32 pb-16 relative z-10">
                <div className="mb-6">
                    <Button variant="ghost" asChild>
                        <Link href="/blogs">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Blogs
                        </Link>
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    <div className="lg:col-span-3">
                        <BlogHeader {...blogPost} />
                        <article className="prose prose-slate max-w-none">
                            <MarkdownRenderer content={blogPost.content} />
                        </article>
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
