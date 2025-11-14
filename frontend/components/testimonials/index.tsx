"use client";

import { motion } from "motion/react";
import { Marquee } from "@/components/ui/marquee";
import { SparklesText } from "@/components/ui/sparkles-text";
import { TestimonialCard } from "./testimonial-card";
import { testimonials } from "./testimonial-data";

export function Testimonials() {
    return (
        <section className="relative w-full py-20 overflow-hidden bg-white dark:bg-zinc-900">
            <div className="container mx-auto px-4">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl flex flex-wrap items-center justify-center gap-x-9">
                        <SparklesText
                            className="text-4xl lg:text-5xl font-semibold inline-block"
                            colors={{ first: "#9E7AFF", second: "#FE8BBB" }}
                            sparklesCount={8}
                        >
                            Loved
                        </SparklesText>
                        <span className="font-semibold">
                            by users worldwide
                        </span>
                    </h2>
                    <p className="mt-4 text-foreground max-w-2xl mx-auto">
                        See what users are saying about their experience with
                        CodeMonster
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                        duration: 0.8,
                        delay: 0.2,
                        ease: "easeOut",
                    }}
                    className="relative flex w-full items-center justify-center overflow-hidden"
                >
                    <Marquee pauseOnHover className="[--duration:25s]">
                        {testimonials.map((testimonial) => (
                            <TestimonialCard
                                key={testimonial.username}
                                {...testimonial}
                            />
                        ))}
                    </Marquee>
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-gradient-to-r from-white via-white/50 to-transparent dark:from-gray-900 dark:via-gray-900/50"></div>
                    <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-gradient-to-l from-white via-white/50 to-transparent dark:from-gray-900 dark:via-gray-900/50"></div>
                </motion.div>
            </div>
        </section>
    );
}
