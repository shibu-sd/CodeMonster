export const LANGUAGE_MAP: Record<string, string> = {
    JAVASCRIPT: "javascript",
    TYPESCRIPT: "typescript",
    PYTHON: "python",
    JAVA: "java",
    CPP: "cpp",
    C: "c",
};

export const getMonacoLanguage = (lang: string): string => {
    return LANGUAGE_MAP[lang] || "javascript";
};

export const getEditorOptions = (
    readOnly: boolean,
    fontSize: number,
    tabSize: number
) => ({
    readOnly,
    fontSize,
    tabSize,
    lineHeight: 1.6,
    fontFamily: "JetBrains Mono, Fira Code, Monaco, Menlo, monospace",
    minimap: { enabled: false },
    scrollBeyondLastLine: false,
    automaticLayout: false,
    insertSpaces: true,
    wordWrap: "on" as const,
    lineNumbers: "on" as const,
    glyphMargin: false,
    folding: true,
    lineDecorationsWidth: 0,
    lineNumbersMinChars: 3,
    renderLineHighlight: "line" as const,
    selectOnLineNumbers: true,
    roundedSelection: false,
    cursorStyle: "line" as const,
    scrollbar: {
        vertical: "auto" as const,
        horizontal: "auto" as const,
        verticalScrollbarSize: 8,
        horizontalScrollbarSize: 8,
    },
    // Performance optimizations
    quickSuggestions: false,
    suggestOnTriggerCharacters: false,
    acceptSuggestionOnCommitCharacter: false,
    tabCompletion: "off" as const,
    wordBasedSuggestions: "off" as const,
    parameterHints: {
        enabled: false,
    },
});
