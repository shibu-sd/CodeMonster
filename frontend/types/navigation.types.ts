export interface MenuItem {
    name: string;
    href: string;
    requireAuth: boolean;
}

export interface FooterLink {
    title: string;
    href: string;
}

export interface FooterLinkGroup {
    group: string;
    items: FooterLink[];
}
