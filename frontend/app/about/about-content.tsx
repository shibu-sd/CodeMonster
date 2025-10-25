"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowRight, Code2, Trophy, Users, Zap } from "lucide-react";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { motion } from "motion/react";

export default function AboutContent() {
    return (
        <div className="min-h-screen bg-background">
            <HeroHeader />
            <div className="container mx-auto px-6 pt-32 pb-16">
                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        About CodeMonster
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Empowering developers worldwide to master algorithms and
                        data structures through interactive coding challenges
                        and real-time competitions.
                    </p>
                </motion.div>

                {/* Mission Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                >
                    <Card className="mb-16">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">
                                Our Mission
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="text-center">
                            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                                To create the most engaging and effective
                                platform for developers to improve their coding
                                skills, compete with peers, and prepare for
                                technical interviews through practice and
                                immediate feedback.
                            </p>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
                >
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="text-center">
                            <CardContent className="pt-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.3 }}
                                >
                                    <Code2 className="h-12 w-12 mx-auto mb-4 text-blue-500" />
                                </motion.div>
                                <h3 className="font-semibold mb-2">
                                    100+ Problems
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Carefully curated coding problems from easy
                                    to hard
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="text-center">
                            <CardContent className="pt-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.4 }}
                                >
                                    <Trophy className="h-12 w-12 mx-auto mb-4 text-yellow-500" />
                                </motion.div>
                                <h3 className="font-semibold mb-2">
                                    Real-time Battles
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Compete 1v1 with other coders in real-time
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="text-center">
                            <CardContent className="pt-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.5 }}
                                >
                                    <Users className="h-12 w-12 mx-auto mb-4 text-green-500" />
                                </motion.div>
                                <h3 className="font-semibold mb-2">
                                    Global Community
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Join thousands of developers improving their
                                    skills
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Card className="text-center">
                            <CardContent className="pt-6">
                                <motion.div
                                    initial={{ scale: 0 }}
                                    whileInView={{ scale: 1 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.3, delay: 0.6 }}
                                >
                                    <Zap className="h-12 w-12 mx-auto mb-4 text-purple-500" />
                                </motion.div>
                                <h3 className="font-semibold mb-2">
                                    Instant Feedback
                                </h3>
                                <p className="text-sm text-muted-foreground">
                                    Get immediate results with detailed
                                    performance analysis
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>

                {/* Story Section */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                >
                    <Card className="mb-16">
                        <CardHeader>
                            <CardTitle className="text-2xl text-center">
                                Our Story
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="max-w-3xl mx-auto space-y-4">
                                <p className="text-muted-foreground">
                                    CodeMonster was born from a simple
                                    observation: while there are many coding
                                    platforms, few truly make the learning
                                    process engaging and fun. We noticed that
                                    developers often struggle with staying
                                    motivated when practicing algorithms and
                                    data structures.
                                </p>
                                <p className="text-muted-foreground">
                                    As a solo developer with a passion for
                                    competitive programming and education, I set
                                    out to create a platform that combines the
                                    rigor of traditional coding practice with
                                    the excitement of real-time competition.
                                    Whether you're preparing for technical
                                    interviews or just love coding challenges,
                                    CodeMonster provides the perfect environment
                                    to grow your skills.
                                </p>
                                <p className="text-muted-foreground">
                                    Today, we're proud to serve a growing
                                    community of developers who share our
                                    passion for coding excellence and continuous
                                    learning.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Call to Action */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-50px" }}
                    transition={{ duration: 0.6, delay: 0.4, ease: "easeOut" }}
                    className="text-center"
                >
                    <h2 className="text-3xl font-bold mb-4">
                        Ready to Start Your Journey?
                    </h2>
                    <p className="text-muted-foreground mb-8">
                        Join thousands of developers already improving their
                        coding skills on CodeMonster.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                    >
                        <Link href="/problems">
                            <Button size="lg" className="gap-2">
                                Start Practicing
                                <motion.div
                                    initial={{ x: 0 }}
                                    whileHover={{ x: 4 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <ArrowRight className="h-4 w-4" />
                                </motion.div>
                            </Button>
                        </Link>
                    </motion.div>
                </motion.div>
            </div>
            <FooterSection />
        </div>
    );
}
