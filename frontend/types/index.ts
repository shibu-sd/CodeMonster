// Common types used across the application

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

export interface SocialLink {
  name: string;
  href: string;
  ariaLabel: string;
  svgPath: string;
}

export interface PartnerLogo {
  name: string;
  src: string;
  height: string;
}

export interface AnimationVariants {
  hidden?: Record<string, any>;
  visible?: Record<string, any>;
  exit?: Record<string, any>;
}

export interface ComponentWithClassName {
  className?: string;
}

export interface ComponentWithChildren {
  children: React.ReactNode;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system';

// Animation preset types
export type TextEffectPreset = 'blur' | 'fade-in-blur' | 'scale' | 'fade' | 'slide';
export type TextEffectPer = 'word' | 'char' | 'line';

// Breakpoint types for responsive design
export type Breakpoint = 'sm' | 'md' | 'lg' | 'xl' | '2xl';

// Common props for UI components
export interface BaseComponentProps extends ComponentWithClassName {
  children?: React.ReactNode;
}