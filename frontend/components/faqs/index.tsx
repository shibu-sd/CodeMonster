"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import type { FaqsAccordionProps } from "@/types";
import { DEFAULT_FAQS } from "./faqs-data";

export function FaqsAccordion({
    title = "Frequently Asked Questions",
    description = "Find answers to common questions about CodeMonster",
    faqs = DEFAULT_FAQS,
}: FaqsAccordionProps) {
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggleAccordion = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="py-20">
            <div className="mx-auto max-w-4xl px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-balance text-4xl font-semibold lg:text-5xl">
                        {title}
                    </h2>
                    <p className="text-foreground max-w-2xl mx-auto mt-4">
                        {description}
                    </p>
                </motion.div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: index * 0.1 }}
                            viewport={{ once: true }}
                            className="group overflow-hidden rounded-2xl border border-border bg-background transition-all hover:border-primary hover:shadow-lg"
                        >
                            <motion.button
                                onClick={() => toggleAccordion(index)}
                                className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-background/50"
                                whileHover={{ scale: 1.01 }}
                                whileTap={{ scale: 0.99 }}
                            >
                                <h3 className="text-foreground text-lg font-semibold pr-4">
                                    {faq.question}
                                </h3>
                                <motion.div
                                    animate={{
                                        rotate: openIndex === index ? 180 : 0,
                                    }}
                                    transition={{
                                        duration: 0.3,
                                        ease: "easeInOut",
                                    }}
                                    className="flex-shrink-0"
                                >
                                    <svg
                                        className="h-5 w-5 text-foreground/60"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M19 9l-7 7-7-7"
                                        />
                                    </svg>
                                </motion.div>
                            </motion.button>

                            <AnimatePresence>
                                {openIndex === index && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{
                                            duration: 0.3,
                                            ease: "easeInOut",
                                        }}
                                        className="overflow-hidden"
                                    >
                                        <motion.div
                                            initial={{ y: -10 }}
                                            animate={{ y: 0 }}
                                            exit={{ y: -10 }}
                                            transition={{
                                                duration: 0.3,
                                                delay: 0.1,
                                            }}
                                            className="px-6 pb-6"
                                        >
                                            <p className="text-foreground/70 leading-relaxed">
                                                {faq.answer}
                                            </p>
                                        </motion.div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
