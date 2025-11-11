import Link from "next/link";
import { Calendar, Clock, TrendingUp, Archive } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogSidebarProps } from "@/types";

export function BlogSidebar({
    recentPosts,
    allTags,
    featuredPosts,
}: BlogSidebarProps) {
    const popularTags = allTags.slice(0, 10);

    return (
        <div className="space-y-6">
            {featuredPosts.length > 0 && (
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5" />
                            Featured Posts
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {featuredPosts.slice(0, 3).map((post) => (
                            <div key={post.slug} className="space-y-2">
                                <Link
                                    href={`/blogs/${post.slug}`}
                                    className="font-medium hover:text-primary transition-colors line-clamp-2"
                                >
                                    {post.title}
                                </Link>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <Calendar className="h-3 w-3" />
                                    <span>
                                        {new Date(
                                            post.date
                                        ).toLocaleDateString()}
                                    </span>
                                    <Clock className="h-3 w-3 ml-2" />
                                    <span>{post.readTime}</span>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            )}

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <Archive className="h-5 w-5" />
                        Recent Posts
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recentPosts.slice(0, 5).map((post) => (
                        <div key={post.slug} className="space-y-2">
                            <Link
                                href={`/blogs/${post.slug}`}
                                className="font-medium hover:text-primary transition-colors line-clamp-2"
                            >
                                {post.title}
                            </Link>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-3 w-3" />
                                <span>
                                    {new Date(post.date).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-lg">Popular Tags</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-wrap gap-2">
                        {popularTags.map((tag, index) => (
                            <Link
                                key={`tag-${index}`}
                                href={`/blogs?tag=${encodeURIComponent(tag)}`}
                            >
                                <Badge
                                    variant="secondary"
                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                >
                                    {tag}
                                </Badge>
                            </Link>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
