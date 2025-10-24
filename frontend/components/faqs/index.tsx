"use client";

import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

interface FaqsAccordionProps {
    title?: string;
    description?: string;
    faqs?: Array<{
        question: string;
        answer: string;
    }>;
}

export function FaqsAccordion({
    title = "Frequently Asked Questions",
    description = "Find answers to common questions about CodeMonster",
    faqs = [
        {
            question: "What is CodeMonster?",
            answer: "CodeMonster is a competitive programming platform that offers 500+ algorithmic problems, real-time 1v1 coding battles, and comprehensive DSA practice. We support multiple programming languages including Python, Java, and C++ with a Monaco Editor for an enhanced coding experience.",
        },
        {
            question: "How do the 1v1 coding battles work?",
            answer: "In 1v1 battles, you compete against another programmer in real-time to solve algorithmic problems. Both participants receive the same problem and race to find the optimal solution. The winner earns rating points and climbs the competitive leaderboard.",
        },
        {
            question: "Which programming languages are supported?",
            answer: "CodeMonster currently supports Python, Java, and C++. You can switch between languages seamlessly using our integrated Monaco Editor. All three languages are available for both practice problems and competitive battles.",
        },
        {
            question: "Is CodeMonster free to use?",
            answer: "Yes! CodeMonster is completely free to use. You can access all 500+ algorithmic problems, participate in coding battles, and compete on the global leaderboard without any cost. We believe in making competitive programming accessible to everyone.",
        },
        {
            question: "How does the rating system work?",
            answer: "Our rating system is based on competitive performance in 1v1 battles and problem-solving accuracy. Starting from 1200 rating points, you can climb to 2100+ by consistently winning battles and solving difficult problems. Your global rank is displayed on the leaderboard.",
        },
        {
            question: "Are the problems suitable for interview preparation?",
            answer: "Absolutely! Our problem set covers all essential data structures and algorithms topics commonly asked in technical interviews. From basic arrays to advanced dynamic programming and graph algorithms, you'll find comprehensive practice material for companies like Google, Microsoft, and Amazon.",
        },
    ],
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
