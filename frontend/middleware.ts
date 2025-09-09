import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtectedRoute = createRouteMatcher([
    "/problems(.*)",
    "/contests(.*)",
    "/leaderboard(.*)",
    "/learn(.*)",
    "/dashboard(.*)",
    "/profile(.*)",
    "/submissions(.*)",
]);

const isPublicRoute = createRouteMatcher([
    "/",
    "/auth/sign-in(.*)",
    "/auth/sign-up(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
    if (isPublicRoute(req)) {
        return;
    }

    if (isProtectedRoute(req)) {
        const { userId } = await auth();
        if (!userId) {
            const signInUrl = new URL("/auth/sign-in", req.url);
            signInUrl.searchParams.set("redirect_url", req.url);
            return Response.redirect(signInUrl);
        }
    }
});

export const config = {
    matcher: [
        "/((?!_next|[^?]*.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
        "/(api|trpc)(.*)",
    ],
};
