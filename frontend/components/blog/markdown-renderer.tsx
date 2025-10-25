"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSlug from "rehype-slug";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({
    content,
    className = "",
}: MarkdownRendererProps) {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);

    const handleCopyCode = async (code: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(code);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error("Failed to copy code:", err);
        }
    };

    return (
        <div className={`prose prose-slate max-w-none ${className}`}>
            <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeSlug]}
                components={{
                    // Custom code block component with copy button
                    code: ({ className, children, ...props }) => {
                        const match = /language-(\w+)/.exec(className || "");
                        const language = match ? match[1] : "";
                        const codeContent = String(children).replace(/\n$/, "");

                        return className ? (
                            <div className="relative group">
                                <div className="flex items-center justify-between bg-muted px-4 py-2 border-b rounded-t-md">
                                    <span className="text-sm font-medium text-muted-foreground">
                                        {language || "code"}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                            handleCopyCode(codeContent)
                                        }
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        {copiedCode === codeContent ? (
                                            <Check className="h-4 w-4" />
                                        ) : (
                                            <Copy className="h-4 w-4" />
                                        )}
                                    </Button>
                                </div>
                                <pre className="overflow-x-auto p-4 bg-muted/50 rounded-b-md">
                                    <code className={className} {...props}>
                                        {children}
                                    </code>
                                </pre>
                            </div>
                        ) : (
                            <code
                                className="bg-muted px-1 py-0.5 rounded text-sm font-mono"
                                {...props}
                            >
                                {children}
                            </code>
                        );
                    },

                    // Custom heading components for better styling
                    h1: ({ children, ...props }) => (
                        <h1
                            className="text-3xl font-bold mt-8 mb-4 text-foreground"
                            {...props}
                        >
                            {children}
                        </h1>
                    ),
                    h2: ({ children, ...props }) => (
                        <h2
                            className="text-2xl font-semibold mt-6 mb-3 text-foreground"
                            {...props}
                        >
                            {children}
                        </h2>
                    ),
                    h3: ({ children, ...props }) => (
                        <h3
                            className="text-xl font-semibold mt-4 mb-2 text-foreground"
                            {...props}
                        >
                            {children}
                        </h3>
                    ),

                    // Custom list components
                    ul: ({ children, ...props }) => (
                        <ul
                            className="list-disc list-inside my-4 space-y-1"
                            {...props}
                        >
                            {children}
                        </ul>
                    ),
                    ol: ({ children, ...props }) => (
                        <ol
                            className="list-decimal list-inside my-4 space-y-1"
                            {...props}
                        >
                            {children}
                        </ol>
                    ),

                    // Custom paragraph component
                    p: ({ children, ...props }) => (
                        <p
                            className="my-4 leading-7 text-foreground"
                            {...props}
                        >
                            {children}
                        </p>
                    ),

                    // Custom blockquote component
                    blockquote: ({ children, ...props }) => (
                        <blockquote
                            className="border-l-4 border-primary pl-4 my-6 italic text-muted-foreground"
                            {...props}
                        >
                            {children}
                        </blockquote>
                    ),

                    // Custom table components
                    table: ({ children, ...props }) => (
                        <div className="overflow-x-auto my-6">
                            <table
                                className="min-w-full border-collapse border border-border"
                                {...props}
                            >
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children, ...props }) => (
                        <thead className="bg-muted" {...props}>
                            {children}
                        </thead>
                    ),
                    th: ({ children, ...props }) => (
                        <th
                            className="border border-border px-4 py-2 text-left font-semibold"
                            {...props}
                        >
                            {children}
                        </th>
                    ),
                    td: ({ children, ...props }) => (
                        <td
                            className="border border-border px-4 py-2"
                            {...props}
                        >
                            {children}
                        </td>
                    ),

                    // Custom link component
                    a: ({ children, href, ...props }) => (
                        <a
                            href={href}
                            className="text-primary hover:text-primary/80 underline transition-colors"
                            target="_blank"
                            rel="noopener noreferrer"
                            {...props}
                        >
                            {children}
                        </a>
                    ),

                    // Custom image component
                    img: ({ src, alt, ...props }) => (
                        <img
                            src={src}
                            alt={alt}
                            className="rounded-lg border border-border max-w-full h-auto my-6"
                            {...props}
                        />
                    ),

                    // Custom horizontal rule
                    hr: ({ ...props }) => (
                        <hr className="my-8 border-border" {...props} />
                    ),
                }}
            >
                {content}
            </ReactMarkdown>

            <style jsx global>{`
                /* Syntax highlighting styles */
                .hljs {
                    background: transparent !important;
                    color: inherit;
                }

                .hljs-comment,
                .hljs-quote {
                    color: #6b7280;
                    font-style: italic;
                }

                .hljs-keyword,
                .hljs-selector-tag,
                .hljs-literal {
                    color: #8b5cf6;
                    font-weight: bold;
                }

                .hljs-string,
                .hljs-doctag {
                    color: #10b981;
                }

                .hljs-number,
                .hljs-variable,
                .hljs-template-variable,
                .hljs-tag .hljs-attr {
                    color: #f59e0b;
                }

                .hljs-function,
                .hljs-title,
                .hljs-section,
                .hljs-built_in {
                    color: #3b82f6;
                }

                .hljs-regexp,
                .hljs-link {
                    color: #ef4444;
                }

                .hljs-type,
                .hljs-class .hljs-title {
                    color: #06b6d4;
                }

                /* Scrollbar styles for code blocks */
                pre::-webkit-scrollbar {
                    height: 8px;
                }

                pre::-webkit-scrollbar-track {
                    background: hsl(var(--muted));
                    border-radius: 4px;
                }

                pre::-webkit-scrollbar-thumb {
                    background: hsl(var(--muted-foreground) / 0.3);
                    border-radius: 4px;
                }

                pre::-webkit-scrollbar-thumb:hover {
                    background: hsl(var(--muted-foreground) / 0.5);
                }
            `}</style>
        </div>
    );
}
