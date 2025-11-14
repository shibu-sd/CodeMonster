import type { BlogPost } from "@/types";
import { BLOG_POSTS } from "./blog.data";

export function getAllBlogPosts(): BlogPost[] {
    return BLOG_POSTS.sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
}

export function getBlogPost(slug: string): BlogPost | null {
    return BLOG_POSTS.find((post) => post.slug === slug) || null;
}

export function getFeaturedBlogPosts(): BlogPost[] {
    return BLOG_POSTS.filter((post) => post.featured);
}

export function getRecentBlogPosts(
    limit: number = 5,
    excludeSlug?: string
): BlogPost[] {
    return BLOG_POSTS.filter((post) => post.slug !== excludeSlug).slice(
        0,
        limit
    );
}

export function getAllTags(): string[] {
    const allTags = BLOG_POSTS.flatMap((post) => post.tags);
    return [...new Set(allTags)].sort();
}

export function getBlogPostsByTag(tag: string): BlogPost[] {
    return BLOG_POSTS.filter((post) =>
        post.tags.some((postTag) => postTag.toLowerCase() === tag.toLowerCase())
    );
}

export function searchBlogPosts(query: string): BlogPost[] {
    const lowercaseQuery = query.toLowerCase();

    return BLOG_POSTS.filter(
        (post) =>
            post.title.toLowerCase().includes(lowercaseQuery) ||
            post.excerpt.toLowerCase().includes(lowercaseQuery) ||
            post.content.toLowerCase().includes(lowercaseQuery) ||
            post.tags.some((tag) => tag.toLowerCase().includes(lowercaseQuery))
    );
}

export function getRelatedBlogPosts(
    currentPost: BlogPost,
    limit: number = 3
): BlogPost[] {
    const otherPosts = BLOG_POSTS.filter(
        (post) => post.slug !== currentPost.slug
    );

    const scoredPosts = otherPosts.map((post) => {
        let score = 0;

        const sharedTags = post.tags.filter((tag) =>
            currentPost.tags.includes(tag)
        );
        score += sharedTags.length * 10;

        if (post.tags[0] === currentPost.tags[0]) {
            score += 5;
        }

        if (post.author === currentPost.author) {
            score += 2;
        }

        return { post, score };
    });

    return scoredPosts
        .sort((a, b) => b.score - a.score)
        .slice(0, limit)
        .map((item) => item.post);
}
