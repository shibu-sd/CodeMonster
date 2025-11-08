import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
    "/problems(.*)",
    "/contests(.*)",
    "/leaderboard(.*)",
    "/learn(.*)",
    "/dashboard(.*)",
    "/profile(.*)",
    "/submissions(.*)",
    "/blogs(.*)",
    "/battle(.*)",
]);

const isPublicRoute = createRouteMatcher([
    "/",
    "/auth/sign-in(.*)",
    "/auth/sign-up(.*)",
]);

async function syncUserToBackend(userId: string) {
    try {
        const clerk = await clerkClient();
        const user = await clerk.users.getUser(userId);

        const response = await fetch(
            `${
                process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"
            }/api/users/sync`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id: user.id,
                    emailAddresses: user.emailAddresses,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    username: user.username,
                    profileImageUrl: user.imageUrl,
                }),
            }
        );

        if (response.ok) {
            console.log("✅ User synced to backend:", userId);
        } else {
            console.error("❌ Failed to sync user:", await response.text());
        }
    } catch (error) {
        console.error("❌ Error syncing user:", error);
    }
}

export default clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) {
        return;
    }

    if (isProtectedRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
            const signInUrl = new URL("/auth/sign-in", req.url);
            signInUrl.searchParams.set("redirect_url", req.url);
            return NextResponse.redirect(signInUrl);
        }

        syncUserToBackend(userId).catch(console.error);
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
