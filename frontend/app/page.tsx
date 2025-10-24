import HeroSection from "@/components/hero-section/hero-section";
import FooterSection from "@/components/footer/footer";
import { Testimonials } from "@/components/testimonials";
import { FaqsAccordion } from "@/components/faqs";
import Image from "next/image";

export default function Home() {
    return (
        <div>
            <HeroSection />
            <Testimonials />
            <FaqsAccordion />
            <FooterSection />
        </div>
    );
}
