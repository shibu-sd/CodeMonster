import { Metadata } from "next";
import AboutContent from "./about-content";

export const metadata: Metadata = {
    title: "About Us - CodeMonster",
    description:
        "Learn about CodeMonster's mission to make coding practice fun and effective for developers worldwide.",
};

export default function AboutPage() {
    return <AboutContent />;
}
