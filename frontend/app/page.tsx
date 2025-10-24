import HeroSection from "@/components/hero-section/hero-section";
import FooterSection from "@/components/footer/footer";
import { Testimonials } from "@/components/testimonials";
import Image from "next/image";

export default function Home() {
    return (
        <div>
            <HeroSection />
            <Testimonials />
            <FooterSection />
        </div>
    );
}
