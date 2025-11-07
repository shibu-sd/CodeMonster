import React from "react";
import Link from "next/link";
import { SOCIAL_LINKS } from "@/constants";

export const SocialLinks: React.FC = () => {
    return (
        <div className="flex flex-wrap justify-center gap-6 text-sm">
            {SOCIAL_LINKS.map((link, index) => (
                <Link
                    key={index}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.ariaLabel}
                    className="text-muted-foreground hover:text-primary block"
                >
                    <svg
                        className="size-6"
                        xmlns="http://www.w3.org/2000/svg"
                        width="1em"
                        height="1em"
                        viewBox="0 0 24 24"
                    >
                        <path fill="currentColor" d={link.svgPath} />
                    </svg>
                </Link>
            ))}
        </div>
    );
};
