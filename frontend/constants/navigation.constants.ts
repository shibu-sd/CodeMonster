import type { MenuItem, FooterLinkGroup } from "@/types";

export const HEADER_MENU_ITEMS: MenuItem[] = [
    { name: "Problems", href: "/problems", requireAuth: true },
    { name: "Battle", href: "/battle", requireAuth: true },
    { name: "Leaderboard", href: "/leaderboard", requireAuth: true },
    { name: "Blogs", href: "/blogs", requireAuth: true },
];

export const FOOTER_LINKS: FooterLinkGroup[] = [
    {
        group: "Practice",
        items: [
            { title: "Problemset", href: "/problems" },
            { title: "Battle", href: "/battle" },
        ],
    },
    {
        group: "Compete",
        items: [
            { title: "Leaderboard", href: "/leaderboard" },
            { title: "Statistics", href: "/dashboard" },
        ],
    },
    {
        group: "Learn",
        items: [{ title: "Blogs", href: "/blogs" }],
    },
    {
        group: "Company",
        items: [
            { title: "About Us", href: "/about" },
            { title: "Privacy Policy", href: "/privacy" },
        ],
    },
] as const;
