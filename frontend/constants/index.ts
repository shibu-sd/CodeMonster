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
        name: "X/Twitter",
        href: "#",
        ariaLabel: "X/Twitter",
        svgPath:
            "M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z",
    },
    {
        name: "LinkedIn",
        href: "#",
        ariaLabel: "LinkedIn",
        svgPath:
            "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z",
    },
    {
        name: "Facebook",
        href: "#",
        ariaLabel: "Facebook",
        svgPath:
            "M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 4.84 3.44 8.87 8 9.8V15H8v-3h2V9.5C10 7.57 11.57 6 13.5 6H16v3h-2c-.55 0-1 .45-1 1v2h3v3h-3v6.95c5.05-.5 9-4.76 9-9.95",
    },
    {
        name: "Threads",
        href: "#",
        ariaLabel: "Threads",
        svgPath:
            "M19.25 8.505c-1.577-5.867-7-5.5-7-5.5s-7.5-.5-7.5 8.995s7.5 8.996 7.5 8.996s4.458.296 6.5-3.918c.667-1.858.5-5.573-6-5.573c0 0-3 0-3 2.5c0 .976 1 2 2.5 2s3.171-1.027 3.5-3c1-6-4.5-6.5-6-4",
    },
    {
        name: "Instagram",
        href: "#",
        ariaLabel: "Instagram",
        svgPath:
            "M7.8 2h8.4C19.4 2 22 4.6 22 7.8v8.4a5.8 5.8 0 0 1-5.8 5.8H7.8C4.6 22 2 19.4 2 16.2V7.8A5.8 5.8 0 0 1 7.8 2m-.2 2A3.6 3.6 0 0 0 4 7.6v8.8C4 18.39 5.61 20 7.6 20h8.8a3.6 3.6 0 0 0 3.6-3.6V7.6C20 5.61 18.39 4 16.4 4zm9.65 1.5a1.25 1.25 0 0 1 1.25 1.25A1.25 1.25 0 0 1 17.25 8A1.25 1.25 0 0 1 16 6.75a1.25 1.25 0 0 1 1.25-1.25M12 7a5 5 0 0 1 5 5a5 5 0 0 1-5 5a5 5 0 0 1-5-5a5 5 0 0 1 5-5m0 2a3 3 0 0 0-3 3a3 3 0 0 0 3 3a3 3 0 0 0 3-3a3 3 0 0 0-3-3",
    },
    {
        name: "TikTok",
        href: "#",
        ariaLabel: "TikTok",
        svgPath:
            "M16.6 5.82s.51.5 0 0A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6c0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64c0 3.33 2.76 5.7 5.69 5.7c3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48",
    },
];

// Footer links structure
export const FOOTER_LINKS: FooterLinkGroup[] = [
    {
        group: "Practice",
        items: [{ title: "All Problems", href: "/problems" }],
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
        items: [{ title: "Blog", href: "/blogs" }],
    },
    {
        group: "Company",
        items: [
            { title: "About Us", href: "#about" },
            { title: "Contact", href: "#contact" },
            { title: "Privacy Policy", href: "#privacy" },
            { title: "Terms of Service", href: "#terms" },
        ],
    },
] as const;

// Header menu items
export const HEADER_MENU_ITEMS: MenuItem[] = [
    { name: "Problems", href: "/problems", requireAuth: true },
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
