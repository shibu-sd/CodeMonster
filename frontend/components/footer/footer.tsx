"use client";

import React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Logo } from "@/components/logo";
import { FooterLinks } from "./footer-links";
import { SocialLinks } from "./social-links";

export default function FooterSection() {
    return (
        <footer className="border-b bg-background pt-20">
            <div className="mx-auto max-w-5xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="grid gap-12 md:grid-cols-5"
                >
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
                </motion.div>
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="mt-12 flex flex-wrap items-end justify-between gap-6 border-t py-6"
                >
                    <span className="text-muted-foreground order-last block text-center text-sm md:order-first">
                        Built with 🧡 by Shibu
                    </span>
                    <div className="order-first md:order-last">
                        <SocialLinks />
                    </div>
                </motion.div>
            </div>
        </footer>
    );
}
