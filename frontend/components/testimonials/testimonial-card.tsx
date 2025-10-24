import { cn } from "@/lib/utils";

interface TestimonialCardProps {
    img: string;
    name: string;
    username: string;
    body: string;
}

export function TestimonialCard({
    img,
    name,
    username,
    body,
}: TestimonialCardProps) {
    return (
        <figure
            className={cn(
                "relative h-full w-80 cursor-pointer overflow-hidden rounded-xl border p-6 transition-all duration-300 hover:scale-105",
                // light styles
                "border-gray-950/[.1] bg-gray-950/[.01] hover:bg-gray-950/[.05] hover:shadow-lg",
                // dark styles
                "dark:border-gray-50/[.1] dark:bg-gray-50/[.05] dark:hover:bg-gray-50/[.10] dark:hover:shadow-xl"
            )}
        >
            <div className="flex flex-row items-center gap-3">
                <img
                    className="rounded-full border-2 border-gray-200 dark:border-gray-700"
                    width="40"
                    height="40"
                    alt={`${name}'s avatar`}
                    src={img}
                />
                <div className="flex flex-col">
                    <figcaption className="text-sm font-semibold dark:text-white">
                        {name}
                    </figcaption>
                    <p className="text-xs font-medium dark:text-white/60">
                        {username}
                    </p>
                </div>
            </div>
            <blockquote className="mt-4 text-sm leading-relaxed dark:text-gray-300">
                "{body}"
            </blockquote>
        </figure>
    );
}
