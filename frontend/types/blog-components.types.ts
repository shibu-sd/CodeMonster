import type { BlogPost } from "./blog.types";

export interface BlogCardProps {
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    tags: string[];
    featured?: boolean;
    readTime: string;
}

export interface BlogHeaderProps {
    title: string;
    excerpt: string;
    author: string;
    date: string;
    tags: string[];
    featured?: boolean;
    readTime: string;
}

export interface BlogSidebarProps {
    recentPosts: BlogPost[];
    allTags: string[];
    featuredPosts: BlogPost[];
}

export interface MarkdownRendererProps {
    content: string;
    className?: string;
}
