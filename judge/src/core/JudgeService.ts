import { CodeExecutor } from "./CodeExecutor";
import {
    CodeSubmission,
    JudgeResult,
    TestCaseResult,
    SubmissionStatus,
    ExecutionResult,
} from "./types";
import { getLanguageConfig } from "../config/LanguageConfig";

export class JudgeService {
    private codeExecutor: CodeExecutor;

    constructor() {
        this.codeExecutor = new CodeExecutor();
    }

    async judgeSubmission(submission: CodeSubmission): Promise<JudgeResult> {
        const { code, language, testCases } = submission;

        try {
            const langConfig = getLanguageConfig(language);

            const result: JudgeResult = {
                status: "ACCEPTED",
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                testCaseResults: [],
                totalRuntime: 0,
                maxMemoryUsage: 0,
            };

            if (langConfig.compileCommand) {
                console.log(`🔧 Testing compilation for ${language}...`);
                const compileResult = await this.testCompilation(
                    code,
                    language
                );
                console.log(
                    `🔧 Compilation result: Success=${compileResult.success}, Error="${compileResult.error}"`
                );
                if (!compileResult.success) {
                    result.status = "COMPILATION_ERROR";
                    result.errorMessage =
                        compileResult.error || "Compilation failed";
                    return result;
                }
                console.log(
                    `✅ Compilation successful, proceeding to test cases...`
                );
            }

            // Execute code against each test case
            for (let i = 0; i < testCases.length; i++) {
                const testCase = testCases[i];
                if (!testCase) {
                    console.error(`❌ Test case ${i + 1} is undefined`);
                    continue;
                }

                console.log(
                    `🧪 Running test case ${i + 1}/${testCases.length}`
                );
                console.log(`📥 Test case input: "${testCase.input}"`);
                console.log(`📤 Expected output: "${testCase.output}"`);

                try {
                    const executionResult = await this.codeExecutor.executeCode(
                        code,
                        language,
                        testCase.input,
                        langConfig.timeLimit,
                        langConfig.memoryLimit
                    );

                    const testCaseResult: TestCaseResult = {
                        input: testCase.input,
                        expectedOutput: testCase.output.trim(),
                        actualOutput: executionResult.output.trim(),
                        passed: false,
                        runtime: executionResult.runtime,
                        memoryUsage: executionResult.memoryUsage,
                        error: executionResult.error || undefined,
                    };

                    result.totalRuntime += executionResult.runtime;
                    result.maxMemoryUsage = Math.max(
                        result.maxMemoryUsage,
                        executionResult.memoryUsage
                    );

                    if (!executionResult.success) {
                        testCaseResult.passed = false;

                        if (
                            executionResult.error?.includes(
                                "Time Limit Exceeded"
                            )
                        ) {
                            result.status = "TIME_LIMIT_EXCEEDED";
                        } else if (
                            executionResult.error?.includes(
                                "Memory Limit Exceeded"
                            )
                        ) {
                            result.status = "MEMORY_LIMIT_EXCEEDED";
                        } else {
                            result.status = "RUNTIME_ERROR";
                        }

                        result.testCaseResults.push(testCaseResult);
                        result.errorMessage =
                            executionResult.error || "Execution failed";
                        break; // Stop on first error
                    }

                    const outputMatches = this.compareOutputs(
                        testCaseResult.expectedOutput,
                        testCaseResult.actualOutput
                    );

                    console.log(`🔍 Test case ${i + 1} comparison:`);
                    console.log(
                        `   Expected: "${testCaseResult.expectedOutput}"`
                    );
                    console.log(
                        `   Actual:   "${testCaseResult.actualOutput}"`
                    );
                    console.log(`   Match:    ${outputMatches}`);

                    if (outputMatches) {
                        testCaseResult.passed = true;
                        result.testCasesPassed++;
                    } else {
                        testCaseResult.passed = false;
                        result.status = "WRONG_ANSWER";
                    }

                    result.testCaseResults.push(testCaseResult);

                    if (
                        !testCaseResult.passed &&
                        process.env.STOP_ON_FIRST_FAILURE === "true"
                    ) {
                        break;
                    }
                } catch (error) {
                    const errorMessage =
                        error instanceof Error
                            ? error.message
                            : "Unknown error";
                    const testCaseResult: TestCaseResult = {
                        input: testCase.input,
                        expectedOutput: testCase.output.trim(),
                        actualOutput: "",
                        passed: false,
                        runtime: 0,
                        memoryUsage: 0,
                        error: errorMessage,
                    };

                    result.testCaseResults.push(testCaseResult);
                    result.status = "INTERNAL_ERROR";
                    result.errorMessage = errorMessage;
                    break;
                }
            }

            if (
                result.status === "ACCEPTED" &&
                result.testCasesPassed < result.totalTestCases
            ) {
                result.status = "WRONG_ANSWER";
            }

            console.log(
                `🏁 Judging complete: ${result.status} (${result.testCasesPassed}/${result.totalTestCases})`
            );
            return result;
        } catch (error) {
            console.error("❌ Judge service error:", error);

            return {
                status: "INTERNAL_ERROR",
                testCasesPassed: 0,
                totalTestCases: testCases.length,
                testCaseResults: [],
                errorMessage:
                    error instanceof Error
                        ? error.message
                        : "Unknown system error",
                totalRuntime: 0,
                maxMemoryUsage: 0,
            };
        }
    }

    private async testCompilation(
        code: string,
        language: string
    ): Promise<ExecutionResult> {
        try {
            const result = await this.codeExecutor.executeCode(
                code,
                language,
                undefined,
                5,
                128
            );

            return result;
        } catch (error) {
            return {
                success: false,
                output: "",
                error:
                    error instanceof Error
                        ? error.message
                        : "Compilation test failed",
                runtime: 0,
                memoryUsage: 0,
                exitCode: -1,
            };
        }
    }

    private compareOutputs(expected: string, actual: string): boolean {
        const normalizeOutput = (output: string): string => {
            return output
                .trim()
                .replace(/\r\n/g, "\n")
                .replace(/\s+$/gm, "")
                .replace(/^\s+/gm, "")
                .replace(/\s+/g, " ");
        };

        const normalizedExpected = normalizeOutput(expected);
        const normalizedActual = normalizeOutput(actual);

        try {
            const expectedJson = JSON.parse(normalizedExpected);
            const actualJson = JSON.parse(normalizedActual);
            return JSON.stringify(expectedJson) === JSON.stringify(actualJson);
        } catch (e) {
            return normalizedExpected === normalizedActual;
        }
    }

    async healthCheck(): Promise<{ healthy: boolean; details: any }> {
        try {
            const dockerHealthy = await this.codeExecutor.healthCheck();
            const systemInfo = await this.codeExecutor.getSystemInfo();

            return {
                healthy: dockerHealthy,
                details: {
                    docker: dockerHealthy,
                    systemInfo: systemInfo
                        ? {
                              containers: systemInfo.Containers,
                              images: systemInfo.Images,
                              memTotal: systemInfo.MemTotal,
                              serverVersion: systemInfo.ServerVersion,
                          }
                        : null,
                },
            };
        } catch (error) {
            return {
                healthy: false,
                details: {
                    error:
                        error instanceof Error
                            ? error.message
                            : "Unknown error",
                },
            };
        }
    }

    getSupportedLanguages(): string[] {
        return ["PYTHON", "JAVA", "CPP"];
    }

    validateSubmission(submission: CodeSubmission): {
        valid: boolean;
        error?: string;
    } {
        if (!submission.code || submission.code.trim().length === 0) {
            return { valid: false, error: "Code cannot be empty" };
        }

        if (!submission.language) {
            return { valid: false, error: "Language must be specified" };
        }

        if (
            !this.getSupportedLanguages().includes(
                submission.language.toUpperCase()
            )
        ) {
            return {
                valid: false,
                error: `Unsupported language: ${submission.language}`,
            };
        }

        if (!submission.testCases || submission.testCases.length === 0) {
            return {
                valid: false,
                error: "At least one test case is required",
            };
        }

        return { valid: true };
    }
}
