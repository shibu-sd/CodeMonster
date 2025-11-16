import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    /* config options here */
    eslint: {
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            {
                hostname: "ik.imagekit.io",
                protocol: "https",
            },
            {
                hostname: "img.clerk.com",
                protocol: "https",
            },
            {
                hostname: "images.clerk.dev",
                protocol: "https",
            },
        ],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === "production" ? {
            exclude: ['error'],
        } : false,
    },
};

export default nextConfig;
