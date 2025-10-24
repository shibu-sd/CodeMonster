"use client";

import Link from "next/link";
import { LogOut, Menu, X, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import React, { useCallback, useState } from "react";
import { cn } from "@/lib/utils";
import {
    SignedIn,
    SignedOut,
    SignOutButton,
    useAuth,
    useUser,
} from "@clerk/nextjs";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useScrollDetection } from "@/hooks/useScrollDetection";
import { HEADER_MENU_ITEMS } from "@/constants";
import { Logo } from "@/components/logo";

export const HeroHeader: React.FC = () => {
    const { isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();
    const [menuState, setMenuState] = useState(false);
    const scrolled = useScrollDetection(0.05);

    const toggleMenu = useCallback(() => {
        setMenuState((prev) => !prev);
    }, []);

    const closeMenu = useCallback(() => {
        setMenuState(false);
    }, []);

    const navigateToProfile = useCallback(() => {
        router.push("/dashboard");
        closeMenu();
    }, [router, closeMenu]);

    return (
        <header>
            <nav
                data-state={menuState && "active"}
                className={cn(
                    "fixed z-20 w-full transition-colors duration-150",
                    scrolled && "bg-background/50 backdrop-blur-3xl border-b"
                )}
            >
                <div className="mx-auto max-w-7xl px-6 transition-all duration-300">
                    <div className="grid grid-cols-3 items-center py-3 lg:py-4">
                        {/* Left: Logo */}
                        <div className="flex justify-start">
                            <Link
                                href="/"
                                aria-label="home"
                                className="flex items-center"
                            >
                                <Logo />
                            </Link>
                        </div>

                        {/* Center: Navigation links */}
                        <div className="hidden lg:flex justify-center">
                            <ul className="flex gap-8 text-base">
                                {HEADER_MENU_ITEMS.filter(
                                    (item) => !item.requireAuth || isSignedIn
                                ).map((item, index) => (
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

                        {/* Right: Buttons and mobile menu */}
                        <div className="flex justify-end items-center gap-3">
                            {/* Buttons on desktop */}
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
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="relative h-8 w-8 rounded-full overflow-hidden border-2 border-primary/20 hover:border-primary transition-colors cursor-pointer">
                                                {user?.imageUrl ? (
                                                    <img
                                                        src={user.imageUrl}
                                                        alt={
                                                            user.firstName || "User"
                                                        }
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="h-full w-full bg-primary/10 flex items-center justify-center">
                                                        <User className="h-4 w-4" />
                                                    </div>
                                                )}
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent
                                            align="end"
                                            alignOffset={-5}
                                            sideOffset={5}
                                            className="w-48"
                                            collisionPadding={10}
                                        >
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    router.push("/dashboard")
                                                }
                                            >
                                                <User className="mr-2 h-4 w-4" />
                                                Profile
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <SignOutButton>
                                                <DropdownMenuItem>
                                                    <LogOut className="mr-2 h-4 w-4" />
                                                    Sign Out
                                                </DropdownMenuItem>
                                            </SignOutButton>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </SignedIn>
                            </div>

                            {/* Mobile menu button */}
                            <button
                                onClick={toggleMenu}
                                aria-label={menuState ? "Close Menu" : "Open Menu"}
                                className="relative z-20 block cursor-pointer p-2.5 lg:hidden"
                            >
                                <Menu className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
                                <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
                            </button>
                        </div>

                        <div className="bg-background in-data-[state=active]:block mb-6 hidden w-full rounded-3xl border p-6 shadow-2xl shadow-zinc-300/20 lg:hidden dark:shadow-none">
                            <div className="space-y-6">
                                <ul className="space-y-6 text-lg">
                                    {HEADER_MENU_ITEMS.filter(
                                        (item) =>
                                            !item.requireAuth || isSignedIn
                                    ).map((item, index) => (
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
                                        <div className="flex flex-col gap-2">
                                            <button
                                                onClick={navigateToProfile}
                                                className="w-full flex items-center gap-2 p-3 rounded-lg border hover:bg-accent transition-colors"
                                            >
                                                {user?.imageUrl && (
                                                    <img
                                                        src={user.imageUrl}
                                                        alt={
                                                            user.firstName ||
                                                            "User"
                                                        }
                                                        className="h-8 w-8 rounded-full object-cover"
                                                    />
                                                )}
                                                <User className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    Profile
                                                </span>
                                            </button>
                                            <SignOutButton>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    className="w-full flex items-center justify-center gap-2"
                                                >
                                                    <LogOut className="h-4 w-4" />
                                                    Sign Out
                                                </Button>
                                            </SignOutButton>
                                        </div>
                                    </SignedIn>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </header>
    );
};
