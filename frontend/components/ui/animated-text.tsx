"use client";
import { TextEffect, TextEffectProps } from "./text-effect";

// AnimatedText is a wrapper around TextEffect for better naming consistency
export function AnimatedText(props: TextEffectProps) {
    return <TextEffect {...props} />;
}
