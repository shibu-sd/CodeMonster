export interface MonacoEditorProps {
    value: string;
    onChange: (value: string) => void;
    language: string;
    readOnly?: boolean;
    height?: string;
    className?: string;
    tabSize?: number;
    fontSize?: number;
}
