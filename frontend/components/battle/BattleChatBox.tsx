"use client";

import { useState, useEffect } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface BattleChatBoxProps {
    battleId: string;
    currentUserId: string;
    opponentUsername?: string;
    onSendMessage: (message: string) => void;
}

export function BattleChatBox({
    battleId,
    currentUserId,
    opponentUsername,
    onSendMessage,
}: BattleChatBoxProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("");
    const [cooldownRemaining, setCooldownRemaining] = useState(0);
    const [lastMessageTime, setLastMessageTime] = useState<number | null>(null);

    const MAX_MESSAGE_LENGTH = 100;
    const COOLDOWN_SECONDS = 60;

    // Cooldown timer
    useEffect(() => {
        if (lastMessageTime) {
            const timer = setInterval(() => {
                const elapsed = Math.floor(
                    (Date.now() - lastMessageTime) / 1000
                );
                const remaining = COOLDOWN_SECONDS - elapsed;

                if (remaining <= 0) {
                    setCooldownRemaining(0);
                    setLastMessageTime(null);
                } else {
                    setCooldownRemaining(remaining);
                }
            }, 1000);

            return () => clearInterval(timer);
        }
    }, [lastMessageTime]);

    const handleSendMessage = () => {
        if (!message.trim() || cooldownRemaining > 0) return;

        onSendMessage(message.trim());
        setMessage("");
        setLastMessageTime(Date.now());
        setCooldownRemaining(COOLDOWN_SECONDS);
        setIsOpen(false);
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const remainingChars = MAX_MESSAGE_LENGTH - message.length;

    return (
        <div className="fixed bottom-4 right-4 z-50">
            {!isOpen ? (
                <Button
                    onClick={() => setIsOpen(true)}
                    size="lg"
                    className="rounded-full w-14 h-14 shadow-lg"
                    disabled={cooldownRemaining > 0}
                >
                    {cooldownRemaining > 0 ? (
                        <span className="text-xs font-bold">
                            {cooldownRemaining}s
                        </span>
                    ) : (
                        <MessageCircle className="w-6 h-6" />
                    )}
                </Button>
            ) : (
                <div className="bg-background border rounded-lg shadow-2xl w-80 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        <h3 className="font-semibold">Send Message</h3>
                    </div>

                    {cooldownRemaining > 0 && (
                        <Badge
                            variant="secondary"
                            className="w-full justify-center"
                        >
                            Wait {cooldownRemaining}s before sending again
                        </Badge>
                    )}

                    <div className="space-y-2">
                        <div className="relative">
                            <Input
                                value={message}
                                onChange={(e) =>
                                    setMessage(
                                        e.target.value.slice(
                                            0,
                                            MAX_MESSAGE_LENGTH
                                        )
                                    )
                                }
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                disabled={cooldownRemaining > 0}
                                className="pr-12"
                                autoFocus
                            />
                            <span
                                className={cn(
                                    "absolute right-3 top-1/2 -translate-y-1/2 text-xs",
                                    remainingChars < 20
                                        ? "text-destructive"
                                        : "text-muted-foreground"
                                )}
                            >
                                {remainingChars}
                            </span>
                        </div>

                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setIsOpen(false)}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSendMessage}
                                disabled={
                                    !message.trim() || cooldownRemaining > 0
                                }
                                className="flex-1"
                            >
                                <Send className="w-4 h-4 mr-2" />
                                Send
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
