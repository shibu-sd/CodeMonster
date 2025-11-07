"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroHeader } from "@/components/header/header";
import FooterSection from "@/components/footer/footer";
import { motion } from "motion/react";
import { DotPattern } from "@/components/ui/dot-pattern";

export default function PrivacyContent() {
    return (
        <div className="min-h-screen bg-background relative">
            <DotPattern className="opacity-30" />
            <HeroHeader />
            <div className="container mx-auto px-6 pt-32 pb-16 relative z-10">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="text-center mb-16"
                >
                    <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                        Privacy Policy
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                        Your privacy is important to us. This policy explains
                        how we collect, use, and protect your information.
                    </p>
                    <p className="text-sm text-muted-foreground mt-4">
                        Last updated: October 25, 2025
                    </p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1,
                                delayChildren: 0.2,
                            },
                        },
                    }}
                    className="max-w-4xl mx-auto space-y-8"
                >
                    {/* Introduction */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Introduction</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    CodeMonster ("we," "us," or "our") is
                                    committed to protecting your privacy. This
                                    Privacy Policy explains how we collect, use,
                                    disclose, and safeguard your information
                                    when you visit our website codemonster.com
                                    and use our services.
                                </p>
                                <p>
                                    By using CodeMonster, you consent to the
                                    data practices described in this policy. If
                                    you do not agree with the terms of this
                                    privacy policy, please do not access or use
                                    our website.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Information We Collect */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Information We Collect</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Personal Information
                                    </h3>
                                    <p className="text-muted-foreground">
                                        When you register for an account, we
                                        collect information such as your name,
                                        email address, and other information you
                                        voluntarily provide. We use this
                                        information to provide, maintain, and
                                        improve our services.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Usage Data
                                    </h3>
                                    <p className="text-muted-foreground">
                                        We collect information about how you use
                                        our services, including problems solved,
                                        submission history, performance metrics,
                                        and other activity data. This helps us
                                        personalize your experience and improve
                                        our platform.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Technical Data
                                    </h3>
                                    <p className="text-muted-foreground">
                                        We automatically collect certain
                                        technical information when you visit our
                                        website, including your IP address,
                                        browser type, device information, and
                                        usage patterns. This data is used for
                                        analytics and service improvement.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* How We Use Your Information */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>
                                    How We Use Your Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">
                                    We use the information we collect to:
                                </p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                    <li>
                                        Provide, maintain, and improve our
                                        services
                                    </li>
                                    <li>
                                        Personalize your experience and track
                                        your progress
                                    </li>
                                    <li>
                                        Communicate with you about your account
                                        and our services
                                    </li>
                                    <li>
                                        Analyze usage patterns to optimize our
                                        platform
                                    </li>
                                    <li>
                                        Ensure the security and integrity of our
                                        services
                                    </li>
                                    <li>Comply with legal obligations</li>
                                </ul>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Information Sharing */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Information Sharing</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    We do not sell, trade, or otherwise transfer
                                    your personal information to third parties
                                    without your consent, except as described in
                                    this policy:
                                </p>

                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Service Providers
                                    </h3>
                                    <p className="text-muted-foreground">
                                        We may share information with trusted
                                        third-party service providers who assist
                                        us in operating our platform, conducting
                                        business, or servicing users.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Legal Requirements
                                    </h3>
                                    <p className="text-muted-foreground">
                                        We may disclose your information if
                                        required by law or in good faith belief
                                        that such action is necessary to comply
                                        with legal obligations.
                                    </p>
                                </div>

                                <div>
                                    <h3 className="font-semibold mb-2">
                                        Public Information
                                    </h3>
                                    <p className="text-muted-foreground">
                                        Certain information, such as your
                                        username, ranking, and public
                                        statistics, may be visible to other
                                        users on leaderboards and public
                                        profiles.
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Data Security */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Data Security</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    We implement appropriate technical and
                                    organizational measures to protect your
                                    personal information against unauthorized
                                    access, alteration, disclosure, or
                                    destruction.
                                </p>
                                <p>
                                    However, no method of transmission over the
                                    internet or method of electronic storage is
                                    100% secure. While we strive to use
                                    commercially acceptable means to protect
                                    your personal information, we cannot
                                    guarantee its absolute security.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Cookies and Tracking */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Cookies and Tracking</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <p>
                                    We use cookies and similar tracking
                                    technologies to track activity on our
                                    website and hold certain information. You
                                    can instruct your browser to refuse all
                                    cookies or to indicate when a cookie is
                                    being sent.
                                </p>
                                <p>
                                    Cookies help us understand your preferences,
                                    improve your experience, and analyze website
                                    traffic. Disabling cookies may affect your
                                    ability to use certain features of our
                                    website.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Your Rights */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Your Rights</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="mb-4">You have the right to:</p>
                                <ul className="list-disc list-inside space-y-2 text-muted-foreground ml-4">
                                    <li>
                                        Access and update your personal
                                        information
                                    </li>
                                    <li>
                                        Delete your account and associated data
                                    </li>
                                    <li>Opt-out of marketing communications</li>
                                    <li>Request a copy of your data</li>
                                    <li>
                                        Object to processing of your information
                                    </li>
                                </ul>
                                <p className="mt-4">
                                    To exercise these rights, please contact us
                                    at support@codemonster.com.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Children's Privacy */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Children's Privacy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    Our services are not intended for children
                                    under the age of 13. We do not knowingly
                                    collect personal information from children
                                    under 13. If you are a parent or guardian
                                    and believe your child has provided us with
                                    personal information, please contact us.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>

                    {/* Changes to This Policy */}
                    <motion.div
                        variants={{
                            hidden: { opacity: 0, y: 30 },
                            visible: { opacity: 1, y: 0 },
                        }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                    >
                        <Card>
                            <CardHeader>
                                <CardTitle>Changes to This Policy</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p>
                                    We may update our Privacy Policy from time
                                    to time. We will notify you of any changes
                                    by posting the new Privacy Policy on this
                                    page and updating the "Last updated" date.
                                </p>
                            </CardContent>
                        </Card>
                    </motion.div>
                </motion.div>
            </div>
            <FooterSection />
        </div>
    );
}
