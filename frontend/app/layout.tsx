import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkThemeProvider } from "@/components/theme-toggle/clerk-theme-provider";
import { ThemeProvider } from "@/components/theme-toggle/theme-provider";
import { BattleProvider } from "@/contexts/BattleContext";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "CodeMonster - Interactive Coding Practice Platform",
    description:
        "Master algorithms and data structures with CodeMonster. Solve problems, compete in contests, and improve your programming skills with instant feedback from our online judge.",
    icons: {
        icon: [
            {
                url: "/favicon.png",
                sizes: "any",
                type: "image/png",
            },
            {
                url: "/icon.png",
                sizes: "32x32",
                type: "image/png",
            },
        ],
        apple: "/logo.png",
        shortcut: "/favicon.png",
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" className="dark" suppressHydrationWarning>
            <head>
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="shortcut icon" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/logo.png" />
            </head>
            <body
                className={`${geistSans.variable} ${geistMono.variable} antialiased`}
                suppressHydrationWarning
            >
                <ThemeProvider
                    attribute="class"
                    defaultTheme="dark"
                    forcedTheme="dark"
                    enableSystem={false}
                    disableTransitionOnChange
                >
                    <ClerkThemeProvider>
                        <BattleProvider>{children}</BattleProvider>
                    </ClerkThemeProvider>
                </ThemeProvider>
            </body>
        </html>
    );
}
