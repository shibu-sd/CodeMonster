"use client";

import { Editor } from "@monaco-editor/react";
import { useTheme } from "next-themes";
import React, {
    useState,
    useRef,
    useCallback,
    useMemo,
    useEffect,
} from "react";
import type { MonacoEditorProps } from "@/types";
import { getMonacoLanguage, getEditorOptions } from "./editor-config";

export const MonacoEditor = React.memo(function MonacoEditor({
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
    const editorRef = useRef<any>(null);
    const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
    const lastEmittedValueRef = useRef<string>(value);
    const isTypingRef = useRef<boolean>(false);

    React.useEffect(() => {
        const currentTheme = theme === "system" ? resolvedTheme : theme;
        setEditorTheme(currentTheme === "dark" ? "vs-dark" : "light");
    }, [theme, resolvedTheme]);

    React.useEffect(() => {
        if (editorRef.current) {
            editorRef.current.updateOptions({
                fontSize: fontSize,
            });
        }
    }, [fontSize]);

    useEffect(() => {
        if (editorRef.current && !isTypingRef.current) {
            const currentEditorValue = editorRef.current.getValue();
            if (
                value !== currentEditorValue &&
                value !== lastEmittedValueRef.current
            ) {
                editorRef.current.setValue(value);
                lastEmittedValueRef.current = value;
            }
        }
    }, [value]);

    const handleEditorDidMount = useCallback((editor: any) => {
        editorRef.current = editor;
        setIsLoading(false);
        lastEmittedValueRef.current = editor.getValue();
        editor.layout();
    }, []);

    const handleEditorChange = useCallback(
        (newValue: string | undefined) => {
            if (newValue === undefined) return;
            isTypingRef.current = true;
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
            }

            debounceTimerRef.current = setTimeout(() => {
                if (newValue !== lastEmittedValueRef.current) {
                    lastEmittedValueRef.current = newValue;
                    onChange(newValue);
                }

                isTypingRef.current = false;
            }, 150);
        },
        [onChange]
    );

    useEffect(() => {
        return () => {
            if (debounceTimerRef.current) {
                clearTimeout(debounceTimerRef.current);
                if (editorRef.current) {
                    const finalValue = editorRef.current.getValue();
                    if (finalValue !== lastEmittedValueRef.current) {
                        onChange(finalValue);
                    }
                }
            }
        };
    }, [onChange]);

    const editorOptions = useMemo(
        () => getEditorOptions(readOnly, fontSize, tabSize),
        [readOnly, fontSize, tabSize]
    );

    return (
        <div className={`relative w-full ${className}`} style={{ height }}>
            <Editor
                height={height}
                language={getMonacoLanguage(language)}
                defaultValue={value}
                onChange={handleEditorChange}
                onMount={handleEditorDidMount}
                theme={editorTheme}
                options={editorOptions}
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
});
