import React from "react";
import Link from "next/link";
import { useAuth } from "@clerk/nextjs";
import { FOOTER_LINKS } from "@/constants";

interface FooterLinksProps {
    className?: string;
}

export const FooterLinks: React.FC<FooterLinksProps> = ({ className }) => {
    const { isSignedIn, isLoaded } = useAuth();

    const handleProtectedLinkClick = (
        e: React.MouseEvent<HTMLAnchorElement>,
        href: string
    ) => {
        if (!isSignedIn && isLoaded) {
            e.preventDefault();
            window.location.href = `/auth/sign-in?redirect_url=${encodeURIComponent(
                href
            )}`;
        }
    };

    const protectedRoutes = [
        "/problems",
        "/battle",
        "/leaderboard",
        "/dashboard",
        "/blogs",
    ];

    return (
        <div className={className}>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {FOOTER_LINKS.map((linkGroup, groupIndex) => (
                    <div key={groupIndex} className="space-y-4 text-sm">
                        <span className="block font-medium">
                            {linkGroup.group}
                        </span>
                        {linkGroup.items.map((item, itemIndex) => {
                            const isProtected = protectedRoutes.some((route) =>
                                item.href.startsWith(route)
                            );

                            return (
                                <Link
                                    key={itemIndex}
                                    href={item.href}
                                    className="text-muted-foreground hover:text-primary block duration-150"
                                    onClick={
                                        isProtected
                                            ? (e) =>
                                                  handleProtectedLinkClick(
                                                      e,
                                                      item.href
                                                  )
                                            : undefined
                                    }
                                >
                                    <span>{item.title}</span>
                                </Link>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
