import { Metadata } from "next";
import PrivacyContent from "@/components/privacy/privacy-content";

export const metadata: Metadata = {
    title: "Privacy Policy - CodeMonster",
    description:
        "CodeMonster's privacy policy and how we protect your data and privacy.",
};

export default function PrivacyPolicyPage() {
    return <PrivacyContent />;
}
