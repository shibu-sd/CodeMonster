import { LanguageConfig } from "../core/types";

export const LANGUAGE_CONFIGS: Record<string, LanguageConfig> = {
    PYTHON: {
        id: "PYTHON",
        name: "Python",
        extension: "py",
        dockerImage: "codemonster-python:latest",
        runCommand: "python /workspace/solution.py",
        timeLimit: 5,
        memoryLimit: 128,
    },

    JAVA: {
        id: "JAVA",
        name: "Java",
        extension: "java",
        dockerImage: "codemonster-java:latest",
        compileCommand: "javac -cp /workspace /workspace/Solution.java",
        runCommand: "java -cp /workspace Solution",
        timeLimit: 10,
        memoryLimit: 512,
    },

    CPP: {
        id: "CPP",
        name: "C++",
        extension: "cpp",
        dockerImage: "codemonster-cpp:latest",
        compileCommand:
            "g++ -o /workspace/solution /workspace/solution.cpp -std=c++17 -O2",
        runCommand: "/workspace/solution",
        timeLimit: 10,
        memoryLimit: 512,
    },
};

export function getLanguageConfig(language: string): LanguageConfig {
    const config = LANGUAGE_CONFIGS[language.toUpperCase()];
    if (!config) {
        throw new Error(`Unsupported language: ${language}`);
    }
    return config;
}

export function getSupportedLanguages(): string[] {
    return Object.keys(LANGUAGE_CONFIGS);
}
