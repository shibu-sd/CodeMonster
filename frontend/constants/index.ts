import type {
    MenuItem,
    FooterLinkGroup,
    SocialLink,
    PartnerLogo,
} from "@/types";

// App constants
export const APP_NAME = "CodeMonster";
export const APP_DESCRIPTION = "Interactive Coding Practice Platform";

// Animation constants
export const ANIMATION = {
    SCROLL_THRESHOLD: 0.05,
    STAGGER_CHILDREN: 0.05,
    DELAY_CHILDREN: 0.75,
    BASE_DURATION: 0.3,
    SPRING_BOUNCE: 0.3,
    SPRING_DURATION: 1.5,
    BLUR_AMOUNT: "12px",
    Y_OFFSET: 12,
} as const;

// Social media links
export const SOCIAL_LINKS: SocialLink[] = [
    {
        name: "LinkedIn",
        href: "https://www.linkedin.com/in/shivaibhav-dewangan-b4b1b8229/",
        ariaLabel: "LinkedIn",
        svgPath:
            "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z",
    },
    {
        name: "X/Twitter",
        href: "https://x.com/shibu10_",
        ariaLabel: "X/Twitter",
        svgPath:
            "M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z",
    },
    {
        name: "GitHub",
        href: "https://github.com/shibu-sd",
        ariaLabel: "GitHub",
        svgPath:
            "M12 .5a11.5 11.5 0 0 0-3.64 22.42c.57.11.78-.25.78-.55v-2c-3.19.69-3.86-1.54-3.86-1.54a3.05 3.05 0 0 0-1.28-1.69c-1.05-.72.08-.7.08-.7a2.42 2.42 0 0 1 1.77 1.2a2.44 2.44 0 0 0 3.34.95a2.44 2.44 0 0 1 .73-1.53c-2.55-.29-5.23-1.28-5.23-5.68a4.46 4.46 0 0 1 1.18-3.08a4.13 4.13 0 0 1 .11-3.04s.96-.31 3.15 1.18a10.85 10.85 0 0 1 5.73 0c2.19-1.49 3.15-1.18 3.15-1.18a4.13 4.13 0 0 1 .11 3.04a4.46 4.46 0 0 1 1.18 3.08c0 4.42-2.69 5.38-5.25 5.67a2.73 2.73 0 0 1 .78 2.12v3.15c0 .31.21.67.79.55A11.5 11.5 0 0 0 12 .5z",
    },
];

// Footer links structure
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

// Header menu items
export const HEADER_MENU_ITEMS: MenuItem[] = [
    { name: "Problems", href: "/problems", requireAuth: true },
    { name: "Battle", href: "/battle", requireAuth: true },
    { name: "Leaderboard", href: "/leaderboard", requireAuth: true },
    { name: "Blogs", href: "/blogs", requireAuth: true },
];

// Partner logos
export const PARTNER_LOGOS: PartnerLogo[] = [
    {
        name: "Nvidia",
        src: "https://html.tailus.io/blocks/customers/nvidia.svg",
        height: "20",
    },
    {
        name: "Column",
        src: "https://html.tailus.io/blocks/customers/column.svg",
        height: "16",
    },
    {
        name: "GitHub",
        src: "https://html.tailus.io/blocks/customers/github.svg",
        height: "16",
    },
    {
        name: "Nike",
        src: "https://html.tailus.io/blocks/customers/nike.svg",
        height: "20",
    },
    {
        name: "Lemon Squeezy",
        src: "https://html.tailus.io/blocks/customers/lemonsqueezy.svg",
        height: "20",
    },
    {
        name: "Laravel",
        src: "https://html.tailus.io/blocks/customers/laravel.svg",
        height: "16",
    },
    {
        name: "Lilly",
        src: "https://html.tailus.io/blocks/customers/lilly.svg",
        height: "28",
    },
    {
        name: "OpenAI",
        src: "https://html.tailus.io/blocks/customers/openai.svg",
        height: "24",
    },
];
