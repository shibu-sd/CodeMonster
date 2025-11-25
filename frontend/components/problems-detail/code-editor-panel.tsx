import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Send, Code2 } from "lucide-react";
import dynamic from "next/dynamic";
import { useState } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { LANGUAGE_ICONS } from "@/constants";

const LanguageIcon = ({ language }: { language: string }) => {
    return LANGUAGE_ICONS[language] || <Code2 className="w-4 h-4" />;
};

// Lazy load Monaco Editor
const MonacoEditor = dynamic(
    () =>
        import("@/components/code-editor/monaco-editor").then(
            (mod) => mod.MonacoEditor
        ),
    {
        loading: () => (
            <div className="flex items-center justify-center w-full h-full bg-muted/50 rounded">
                <div className="text-center space-y-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto"></div>
                    <p className="text-sm text-muted-foreground font-medium">
                        Loading code editor...
                    </p>
                </div>
            </div>
        ),
        ssr: false,
    }
);
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface CodeEditorPanelProps {
    selectedLanguage: string;
    code: string;
    onLanguageChange: (language: string) => void;
    onCodeChange: (code: string) => void;
    onCodeReset: () => void;
    onRunCode: () => void;
    onSubmitCode: () => void;
    isSubmitting: boolean;
    isRunning: boolean;
    availableLanguages: Array<{ id: string; name: string; extension: string }>;
}

export function CodeEditorPanel({
    selectedLanguage,
    code,
    onLanguageChange,
    onCodeChange,
    onCodeReset,
    onRunCode,
    onSubmitCode,
    isSubmitting,
    isRunning,
    availableLanguages,
}: CodeEditorPanelProps) {
    const [fontSize, setFontSize] = useState(14);
    const [showResetDialog, setShowResetDialog] = useState(false);

    const fontSizes = [12, 14, 16, 18, 20, 22, 24];

    const handleResetClick = () => {
        setShowResetDialog(true);
    };

    const handleResetConfirm = () => {
        onCodeReset();
        setShowResetDialog(false);
    };

    return (
        <div className="flex flex-col h-full space-y-3">
            <div className="flex items-center justify-between bg-card rounded-lg p-3 border flex-shrink-0">
                <div className="flex items-center gap-10">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Language:</label>
                        <Select
                            value={selectedLanguage}
                            onValueChange={onLanguageChange}
                            disabled={isSubmitting}
                        >
                            <SelectTrigger size="sm" className="w-[140px]">
                                <SelectValue>
                                    <div className="flex items-center gap-2">
                                        <LanguageIcon
                                            language={selectedLanguage}
                                        />
                                        <span>
                                            {availableLanguages.find(
                                                (l) => l.id === selectedLanguage
                                            )?.name || selectedLanguage}
                                        </span>
                                    </div>
                                </SelectValue>
                            </SelectTrigger>
                            <SelectContent>
                                {availableLanguages.map((lang) => (
                                    <SelectItem key={lang.id} value={lang.id}>
                                        <div className="flex items-center gap-2">
                                            <LanguageIcon language={lang.id} />
                                            <span>{lang.name}</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">
                            Font Size:
                        </label>
                        <Select
                            value={fontSize.toString()}
                            onValueChange={(value) =>
                                setFontSize(Number(value))
                            }
                            disabled={isSubmitting}
                        >
                            <SelectTrigger size="sm" className="w-[90px]">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {fontSizes.map((size) => (
                                    <SelectItem
                                        key={size}
                                        value={size.toString()}
                                    >
                                        {size}px
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleResetClick}
                        disabled={isSubmitting}
                        className="transform hover:scale-105 transition-all duration-200"
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onRunCode}
                        disabled={isSubmitting || isRunning || !code.trim()}
                        className="transform hover:scale-105 transition-all duration-200"
                    >
                        <Play className="h-4 w-4 mr-2" />
                        {isRunning ? "Running..." : "Run"}
                    </Button>

                    <Button
                        size="sm"
                        onClick={onSubmitCode}
                        disabled={isSubmitting || isRunning || !code.trim()}
                        className="transform hover:scale-105 transition-all duration-200"
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </div>

            <div className="bg-card rounded-lg border overflow-hidden flex-1">
                <MonacoEditor
                    value={code}
                    onChange={onCodeChange}
                    language={selectedLanguage}
                    height="100%"
                    className="w-full h-full"
                    tabSize={4}
                    fontSize={fontSize}
                />
            </div>

            <AlertDialog
                open={showResetDialog}
                onOpenChange={setShowResetDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset Code?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will reset your code to the starter template.
                            All your current changes will be lost. Do you really
                            want to do this?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleResetConfirm}>
                            Reset Code
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}
