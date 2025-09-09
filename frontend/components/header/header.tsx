"use client";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";
import { cn } from "@/lib/utils";
import { useScroll } from "motion/react";
import { ThemeToggle } from "@/components/theme-toggle/theme-toggle";
import { SignedIn, SignedOut, UserButton, useAuth } from "@clerk/nextjs";

const menuItems = [
    { name: "Problems", href: "/problems", requireAuth: true },
    { name: "Contests", href: "#contests", requireAuth: true },
    { name: "Leaderboard", href: "#leaderboard", requireAuth: true },
    { name: "Learn", href: "#learn", requireAuth: true },
];

export const HeroHeader = () => {
    const { isSignedIn } = useAuth();
    const [menuState, setMenuState] = React.useState(false);
    const [scrolled, setScrolled] = React.useState(false);

    const { scrollYProgress } = useScroll();

    React.useEffect(() => {
        const unsubscribe = scrollYProgress.on("change", (latest) => {
            setScrolled(latest > 0.05);
        });
        return () => unsubscribe();
    }, [scrollYProgress]);

    return (
        <header>
            <nav
                data-state={menuState && "active"}
                className={cn(
                    "fixed z-20 w-full border-b transition-colors duration-150",
                    scrolled && "bg-background/50 backdrop-blur-3xl"
                )}
            >
                <div className="mx-auto max-w-7xl px-6 transition-all duration-300">
                    <div className="relative flex items-center justify-between py-3 lg:py-4">
                        <div className="flex items-center">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center"
                            >
                                <Logo />
                            </Link>
                        </div>

                        <div className="hidden lg:flex lg:flex-1 lg:justify-center">
                            <ul className="flex gap-8 text-base">
                                {menuItems
                                    .filter(
                                        (item) =>
                                            !item.requireAuth || isSignedIn
                                    )
                                    .map((item, index) => (
                                        <li key={index}>
                                            {item.requireAuth && !isSignedIn ? (
                                                <Link
                                                    href="/auth/sign-in"
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150"
                                                >
                                                    <span>{item.name}</span>
                                                </Link>
                                            ) : (
                                                <Link
                                                    href={item.href}
                                                    className="text-muted-foreground hover:text-accent-foreground block duration-150"
                                                >
                                                    <span>{item.name}</span>
                                                </Link>
                                            )}
                                        </li>
                                    ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => setMenuState(!menuState)}
                            aria-label={
                                menuState == true ? "Close Menu" : "Open Menu"
                            }
                            className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                        >
                            <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                            <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                        </button>

                        <div className="hidden lg:flex lg:items-center lg:gap-3">
                            <SignedOut>
                                <Link href="/auth/sign-in">
                                    <Button variant="outline" size="sm">
                                        Login
                                    </Button>
                                </Link>
                                <Link href="/auth/sign-up">
                                    <Button size="sm">Sign Up</Button>
                                </Link>
                            </SignedOut>
                            <SignedIn>
                                <UserButton />
                            </SignedIn>
                            <ThemeToggle />
                        </div>

                        <div className="bg-background in-data-[state=active]:block mb-6 hidden w-full rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 lg:hidden dark:shadow-none">
                            <div className="space-y-6">
                                <ul className="space-y-6 text-lg">
                                    {menuItems
                                        .filter(
                                            (item) =>
                                                !item.requireAuth || isSignedIn
                                        )
                                        .map((item, index) => (
                                            <li key={index}>
                                                {item.requireAuth &&
                                                !isSignedIn ? (
                                                    <Link
                                                        href="/auth/sign-in"
                                                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                                                    >
                                                        <span>{item.name}</span>
                                                    </Link>
                                                ) : (
                                                    <Link
                                                        href={item.href}
                                                        className="text-muted-foreground hover:text-accent-foreground block duration-150"
                                                    >
                                                        <span>{item.name}</span>
                                                    </Link>
                                                )}
                                            </li>
                                        ))}
                                </ul>
                                <div className="flex flex-col space-y-3 pt-4 border-t">
                                    <SignedOut>
                                        <Link href="/auth/sign-in">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="w-full"
                                            >
                                                Login
                                            </Button>
                                        </Link>
                                        <Link href="/auth/sign-up">
                                            <Button
                                                size="sm"
                                                className="w-full"
                                            >
                                                Sign Up
                                            </Button>
                                        </Link>
                                    </SignedOut>
                                    <SignedIn>
                                        <div className="flex justify-center">
                                            <UserButton />
                                        </div>
                                    </SignedIn>
                                    <div className="flex justify-center pt-2">
                                        <ThemeToggle />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};
