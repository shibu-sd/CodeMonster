import type { BlogPost } from "@/types";

export function getCurrentPostIndex(
    allPosts: BlogPost[],
    slug: string
): number {
    return allPosts.findIndex((post) => post.slug === slug);
}

export function getPreviousPost(
    allPosts: BlogPost[],
    slug: string
): BlogPost | null {
    const currentIndex = getCurrentPostIndex(allPosts, slug);
    if (currentIndex < allPosts.length - 1) {
        return allPosts[currentIndex + 1];
    }
    return null;
}

export function getNextPost(
    allPosts: BlogPost[],
    slug: string
): BlogPost | null {
    const currentIndex = getCurrentPostIndex(allPosts, slug);
    if (currentIndex > 0) {
        return allPosts[currentIndex - 1];
    }
    return null;
}

export function getRelatedPosts(
    allPosts: BlogPost[],
    currentPost: BlogPost,
    slug: string,
    limit: number = 3
): BlogPost[] {
    const otherPosts = allPosts.filter((post) => post.slug !== slug);

    const scoredPosts = otherPosts.map((post) => {
        let score = 0;

        const sharedTags = post.tags.filter((tag: string) =>
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
