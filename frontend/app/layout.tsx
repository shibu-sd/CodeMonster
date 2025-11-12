import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkThemeProvider } from "@/components/theme-toggle/clerk-theme-provider";
import { ThemeProvider } from "@/components/theme-toggle/theme-provider";
import { BattleProvider } from "@/contexts/BattleContext";
import "./globals.css";

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
    display: "swap",
    preload: true,
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
    display: "swap",
    preload: true,
});

export const metadata: Metadata = {
    title: "CodeMonster - The Ultimate Coding Arena",
    description:
        "Solve algorithmic challenges, compete on leaderboards, and master DSA through real-time battles. Train your logic, track your progress, and evolve into an unstoppable coding monster.",
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
                <link
                    rel="preconnect"
                    href={
                        process.env.NEXT_PUBLIC_API_URL ||
                        "http://localhost:5000"
                    }
                />
                <link rel="preconnect" href="https://clerk.com" />
                <link rel="dns-prefetch" href="https://clerk.com" />
                <link rel="preconnect" href="https://ik.imagekit.io" />
                <link rel="dns-prefetch" href="https://ik.imagekit.io" />
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
