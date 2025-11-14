import React from "react";
import Link from "next/link";
import { FOOTER_LINKS } from "@/constants";
import type { FooterLinksProps } from "@/types";

export const FooterLinks: React.FC<FooterLinksProps> = ({ className }) => {
    return (
        <div className={className}>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
                {FOOTER_LINKS.map((linkGroup, groupIndex) => (
                    <div key={groupIndex} className="space-y-4 text-sm">
                        <span className="block font-medium">
                            {linkGroup.group}
                        </span>
                        {linkGroup.items.map((item, itemIndex) => (
                            <Link
                                key={itemIndex}
                                href={item.href}
                                className="text-muted-foreground hover:text-primary block duration-150"
                            >
                                <span>{item.title}</span>
                            </Link>
                        ))}
                    </div>
                ))}
            </div>
        </div>
    );
};
