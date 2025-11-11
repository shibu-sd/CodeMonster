"use client";

import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import React, { useState, useRef } from "react";
import type { MonacoEditorProps } from "@/types";
import { getMonacoLanguage, getEditorOptions } from "./editor-config";

export function MonacoEditor({
    value,
    onChange,
    language,
    readOnly = false,
    height = "400px",
    className = "",
    tabSize = 4,
    fontSize = 14,
}: MonacoEditorProps) {
    const { theme, resolvedTheme } = useTheme();
    const [isLoading, setIsLoading] = useState(true);
    const [editorTheme, setEditorTheme] = useState("light");
    const editorRef = useRef(null);

    React.useEffect(() => {
        const currentTheme = theme === "system" ? resolvedTheme : theme;
        setEditorTheme(currentTheme === "dark" ? "vs-dark" : "light");
    }, [theme, resolvedTheme]);

    React.useEffect(() => {
        if (editorRef.current) {
            (editorRef.current as any).updateOptions({
                fontSize: fontSize,
            });
        }
    }, [fontSize]);

    const handleEditorDidMount = (editor: any) => {
        editorRef.current = editor;
        setIsLoading(false);
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
                options={getEditorOptions(readOnly, fontSize, tabSize)}
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
