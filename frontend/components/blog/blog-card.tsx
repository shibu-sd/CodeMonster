"use client";

import Link from "next/link";
import { Calendar, User, Clock, Tag } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { BlogCardProps } from "@/types";

export function BlogCard({
    slug,
    title,
    excerpt,
    author,
    date,
    tags,
    featured = false,
    readTime,
}: BlogCardProps) {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <Card
            className={`group hover:shadow-lg transition-all duration-300 ${
                featured ? "ring-2 ring-primary/20 hover:ring-primary/40" : ""
            }`}
        >
            <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        {featured && (
                            <Badge variant="default" className="mb-2">
                                Featured
                            </Badge>
                        )}
                        <h3 className="text-xl font-semibold group-hover:text-primary transition-colors line-clamp-2">
                            <Link
                                href={`/blogs/${slug}`}
                                className="hover:underline"
                            >
                                {title}
                            </Link>
                        </h3>
                    </div>
                </div>
                <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
                    {excerpt}
                </p>
            </CardHeader>
            <CardContent className="pt-0">
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{readTime}</span>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap gap-1">
                    {tags.slice(0, 3).map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                        >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                        </Badge>
                    ))}
                    {tags.length > 3 && (
                        <div className="relative group/tags">
                            <Badge
                                variant="outline"
                                className="text-xs cursor-pointer hover:bg-primary/10 transition-colors"
                            >
                                +{tags.length - 3}
                            </Badge>

                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-3 opacity-0 invisible group-hover/tags:opacity-100 group-hover/tags:visible transition-all duration-200 ease-out z-50 pointer-events-none">
                                <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-px">
                                    <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[6px] border-t-background"></div>
                                </div>
                                <div className="relative bg-background border border-border/40 shadow-lg rounded-lg px-3 py-2 backdrop-blur-sm">
                                    <div className="flex flex-wrap gap-1.5 max-w-[200px]">
                                        {tags.slice(3).map((tag, index) => (
                                            <span
                                                key={tag}
                                                className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-colors"
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
