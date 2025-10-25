import { Calendar, User, Clock, Tag } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BlogHeaderProps {
    title: string;
    excerpt: string;
    author: string;
    date: string;
    tags: string[];
    featured?: boolean;
    readTime: string;
}

export function BlogHeader({
    title,
    excerpt,
    author,
    date,
    tags,
    featured = false,
    readTime,
}: BlogHeaderProps) {
    const formattedDate = new Date(date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="mb-8 pb-8 border-b">
            <div className="flex flex-col space-y-4">
                <div className="space-y-2">
                    {featured && (
                        <Badge variant="default" className="w-fit">
                            Featured Article
                        </Badge>
                    )}
                    <h1 className="text-3xl md:text-4xl font-bold leading-tight">
                        {title}
                    </h1>
                    <p className="text-lg text-muted-foreground leading-relaxed">
                        {excerpt}
                    </p>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            <span className="font-medium">{author}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            <span>{readTime} read</span>
                        </div>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                        <Badge
                            key={tag}
                            variant="secondary"
                            className="text-xs"
                        >
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                        </Badge>
                    ))}
                </div>
            </div>
        </div>
    );
}
