import React from "react";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { FooterLinks } from "./footer-links";
import { SocialLinks } from "./social-links";

export default function FooterSection() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="border-b bg-background pt-20">
            <div className="mx-auto max-w-5xl px-6">
                <div className="grid gap-12 md:grid-cols-5">
                    <div className="md:col-span-2">
                        <Link
                            href="/"
                            aria-label="go home"
                            className="block size-fit"
                        >
                            <Logo />
                        </Link>
                    </div>

                    <div className="md:col-span-3">
                        <FooterLinks />
                    </div>
                </div>
                <div className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6">
                    <span className="text-muted-foreground order-last block text-center text-sm md:order-first">
                        © {currentYear} CodeMonster, All rights reserved
                    </span>
                    <div className="order-first md:order-last">
                        <SocialLinks />
                    </div>
                </div>
            </div>
        </footer>
    );
}
