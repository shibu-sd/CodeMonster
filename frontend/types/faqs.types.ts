export interface FaqItem {
    question: string;
    answer: string;
}

export interface FaqsAccordionProps {
    title?: string;
    description?: string;
    faqs?: FaqItem[];
}
