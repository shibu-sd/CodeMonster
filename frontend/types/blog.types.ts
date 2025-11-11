export interface BlogPost {
    slug: string;
    title: string;
    excerpt: string;
    author: string;
    date: string;
    tags: string[];
    featured: boolean;
    readTime: string;
    content: string;
}
