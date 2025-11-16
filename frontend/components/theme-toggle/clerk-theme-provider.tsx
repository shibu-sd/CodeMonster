"use client";

import { ClerkProvider } from "@clerk/nextjs";
import { dark, shadcn } from "@clerk/themes";
import { useTheme } from "next-themes";
import { ReactNode } from "react";

interface ClerkThemeProviderProps {
    children: ReactNode;
    signInUrl?: string;
    signUpUrl?: string;
    signInFallbackRedirectUrl?: string;
    signUpFallbackRedirectUrl?: string;
}

export function ClerkThemeProvider({
    children,
    signInUrl = "/auth/sign-in",
    signUpUrl = "/auth/sign-up",
    signInFallbackRedirectUrl = "/",
    signUpFallbackRedirectUrl = "/",
}: ClerkThemeProviderProps) {
    const { theme } = useTheme();

    const clerkTheme = theme === "dark" ? dark : shadcn;

    return (
        <ClerkProvider
            signInUrl={signInUrl}
            signUpUrl={signUpUrl}
            signInFallbackRedirectUrl={signInFallbackRedirectUrl}
            signUpFallbackRedirectUrl={signUpFallbackRedirectUrl}
            appearance={{
                baseTheme: clerkTheme,
                variables: {
                    colorPrimary: "hsl(var(--primary))",
                    colorBackground: "hsl(var(--background))",
                    colorInputBackground: "hsl(var(--muted))",
                    colorInputText: "hsl(var(--foreground))",
                    colorText: "hsl(var(--foreground))",
                    colorTextSecondary: "hsl(var(--muted-foreground))",
                    borderRadius: "0.75rem",
                },
                elements: {
                    formButtonPrimary: {
                        backgroundColor: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                        border: "none",
                        "&:hover": {
                            backgroundColor: "hsl(var(--primary) / 0.9)",
                        },
                        "&:focus": {
                            backgroundColor: "hsl(var(--primary))",
                            boxShadow: "0 0 0 2px hsl(var(--ring))",
                        },
                    },
                    submitButton: {
                        backgroundColor: "hsl(var(--primary))",
                        color: "hsl(var(--primary-foreground))",
                        border: "none",
                    },
                },
            }}
        >
            {children}
        </ClerkProvider>
    );
}
