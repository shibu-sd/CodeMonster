"use client";

import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import React, { useState, useRef } from "react";

interface MonacoEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
    readOnly?: boolean;
    height?: string;
    className?: string;
    tabSize?: number;
}

export function MonacoEditor({
    value,
    onChange,
    language,
    readOnly = false,
    height = "400px",
    className = "",
    tabSize = 4,
}: MonacoEditorProps) {
    const { theme, resolvedTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [editorTheme, setEditorTheme] = useState("light");
    const editorRef = useRef(null);

    React.useEffect(() => {
        const currentTheme = theme === "system" ? resolvedTheme : theme;
        setEditorTheme(currentTheme === "dark" ? "vs-dark" : "light");
    }, [theme, resolvedTheme]);

    const getMonacoLanguage = (lang: string) => {
        const languageMap: Record<string, string> = {
            JAVASCRIPT: "javascript",
            TYPESCRIPT: "typescript",
            PYTHON: "python",
            JAVA: "java",
            CPP: "cpp",
            C: "c",
        };
        return languageMap[lang] || "javascript";
    };

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
        setIsLoading(false);

        editor.updateOptions({
            fontSize: 14,
            lineHeight: 1.6,
            fontFamily: "JetBrains Mono, Fira Code, Monaco, Menlo, monospace",
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: tabSize,
            insertSpaces: true,
            wordWrap: "on",
            lineNumbers: "on",
            glyphMargin: false,
            folding: true,
            lineDecorationsWidth: 0,
            lineNumbersMinChars: 3,
            renderLineHighlight: "line",
            scrollbar: {
                vertical: "auto",
                horizontal: "auto",
                verticalScrollbarSize: 8,
                horizontalScrollbarSize: 8,
            },
        });
    };

    const handleEditorChange = (newValue: string | undefined) => {
        if (newValue !== undefined) {
            onChange(newValue);
        }
    };

    return (
        <div className={`relative w-full ${className}`} style={{ height }}>
            <Editor
                height={height}
                language={getMonacoLanguage(language)}
                value={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={editorTheme}
                options={{
                    readOnly,
                    selectOnLineNumbers: true,
                    roundedSelection: false,
                    cursorStyle: "line",
                    automaticLayout: true,
                    scrollBeyondLastLine: false,
                    wordWrap: "on",
                    minimap: { enabled: false },
                    fontSize: 14,
                    lineHeight: 1.6,
                    fontFamily:
                        "JetBrains Mono, Fira Code, Monaco, Menlo, monospace",
                    lineNumbers: "on",
                    glyphMargin: false,
                    folding: true,
                    lineDecorationsWidth: 0,
                    lineNumbersMinChars: 3,
                    renderLineHighlight: "line",
                    scrollbar: {
                        vertical: "auto",
                        horizontal: "auto",
                        verticalScrollbarSize: 8,
                        horizontalScrollbarSize: 8,
                    },
                }}
                loading={
                    <div className="flex items-center justify-center w-full h-full bg-muted rounded">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
                            <p className="text-sm text-muted-foreground">
                                Loading editor...
                            </p>
                        </div>
                    </div>
                }
            />
        </div>
    );
}
