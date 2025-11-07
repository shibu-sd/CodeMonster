import { Button } from "@/components/ui/button";
import { RotateCcw, Play, Send } from "lucide-react";
import { MonacoEditor } from "@/components/code-editor/monaco-editor";
import { useState } from "react";

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

    const fontSizes = [12, 14, 16, 18, 20, 22, 24];
    return (
        <div className="flex flex-col h-full space-y-3">
            {/* Editor Header */}
            <div className="flex items-center justify-between bg-card rounded-lg p-3 border flex-shrink-0">
                <div className="flex items-center gap-10">
                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">Language:</label>
                        <select
                            value={selectedLanguage}
                            onChange={(e) => onLanguageChange(e.target.value)}
                            className="px-3 py-1 border border-border rounded-md bg-background text-sm"
                            disabled={isSubmitting}
                        >
                            {availableLanguages.map((lang) => (
                                <option key={lang.id} value={lang.id}>
                                    {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="flex items-center space-x-2">
                        <label className="text-sm font-medium">
                            Font Size:
                        </label>
                        <select
                            value={fontSize}
                            onChange={(e) =>
                                setFontSize(Number(e.target.value))
                            }
                            className="px-3 py-1 border border-border rounded-md bg-background text-sm"
                            disabled={isSubmitting}
                        >
                            {fontSizes.map((size) => (
                                <option key={size} value={size}>
                                    {size}px
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCodeReset}
                        disabled={isSubmitting}
                    >
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Reset
                    </Button>

                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={onRunCode}
                        disabled={isSubmitting || isRunning || !code.trim()}
                    >
                        <Play className="h-4 w-4 mr-2" />
                        {isRunning ? "Running..." : "Run"}
                    </Button>

                    <Button
                        size="sm"
                        onClick={onSubmitCode}
                        disabled={isSubmitting || isRunning || !code.trim()}
                    >
                        <Send className="h-4 w-4 mr-2" />
                        {isSubmitting ? "Submitting..." : "Submit"}
                    </Button>
                </div>
            </div>

            {/* Monaco Code Editor - Full Height */}
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
        </div>
    );
}
