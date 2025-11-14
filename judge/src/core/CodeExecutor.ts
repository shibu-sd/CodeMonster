import Docker from "dockerode";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs-extra";
import * as path from "path";
import {
    ExecutionResult,
    DockerExecutionOptions,
    LanguageConfig,
} from "./types";
import { getLanguageConfig } from "../config/LanguageConfig";

export class CodeExecutor {
    private docker: Docker;
    private tempDir: string;

    constructor() {
        this.docker = new Docker();
        this.tempDir = path.join(process.cwd(), "temp");
        console.log("🏗️ CodeExecutor initialized with temp dir:", this.tempDir);
        this.ensureTempDir();
    }

    private async ensureTempDir(): Promise<void> {
        try {
            await fs.ensureDir(this.tempDir);
            console.log("✅ Temp directory ensured:", this.tempDir);
        } catch (error) {
            console.error("❌ Failed to create temp directory:", error);
            throw new Error("Failed to initialize code executor");
        }
    }

    // Execute code in a secure Docker container
    async executeCode(
        code: string,
        language: string,
        input?: string,
        timeLimit?: number,
        memoryLimit?: number,
        workspaceDir?: string
    ): Promise<ExecutionResult> {
        const executionId = workspaceDir
            ? path.basename(workspaceDir)
            : uuidv4();

        let workspace: string;
        let shouldCleanup: boolean;

        if (workspaceDir) {
            const uniqueId = uuidv4();
            workspace = path.join(this.tempDir, uniqueId);
            shouldCleanup = true;

            await fs.copy(workspaceDir, workspace);
            console.log(`📋 Copied compiled workspace to: ${workspace}`);
        } else {
            workspace = path.join(this.tempDir, executionId);
            shouldCleanup = true;
        }

        console.log(`🚀 Starting code execution: ${executionId} (${language})`);

        try {
            const langConfig = getLanguageConfig(language);
            console.log(`📋 Language config loaded: ${langConfig.name}`);

            if (!workspaceDir) {
                await this.createWorkspace(workspace, code, input, langConfig);
                console.log(`📁 Workspace created: ${workspace}`);
            } else {
                if (input) {
                    console.log(
                        `📝 Writing input to workspace copy: "${input}"`
                    );
                    await fs.writeFile(
                        path.join(workspace, "input.txt"),
                        input,
                        "utf8"
                    );
                }
                console.log(`♻️  Using workspace copy for execution`);
            }

            const result = await this.runInDocker(
                workspace,
                langConfig,
                timeLimit || langConfig.timeLimit,
                memoryLimit || langConfig.memoryLimit
            );

            console.log(
                `✅ Execution completed: ${executionId} - Success: ${result.success}`
            );
            return result;
        } catch (error) {
            console.error(
                `❌ Code execution failed for ${executionId}:`,
                error
            );
            return {
                success: false,
                output: "",
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown execution error",
                runtime: 0,
                memoryUsage: 0,
                exitCode: -1,
            };
        } finally {
            if (shouldCleanup) {
                console.log(`🧹 Cleaning up workspace: ${workspace}`);
                await this.cleanupWorkspace(workspace);
            }
        }
    }

    async compileCode(
        code: string,
        language: string
    ): Promise<{ success: boolean; workspaceDir?: string; error?: string }> {
        const executionId = uuidv4();
        const workspaceDir = path.join(this.tempDir, executionId);

        console.log(`🔧 Compiling code: ${executionId} (${language})`);

        try {
            const langConfig = getLanguageConfig(language);

            if (!langConfig.compileCommand) {
                return {
                    success: true,
                    error: "Language does not require compilation",
                };
            }

            await this.createWorkspace(
                workspaceDir,
                code,
                undefined,
                langConfig
            );
            console.log(`📁 Compilation workspace created: ${workspaceDir}`);

            const result = await this.executeCode(
                code,
                language,
                undefined,
                5,
                128,
                workspaceDir
            );

            if (!result.success) {
                await this.cleanupWorkspace(workspaceDir);
                return {
                    success: false,
                    error: result.error || "Compilation failed",
                };
            }

            console.log(`✅ Compilation successful: ${executionId}`);
            return {
                success: true,
                workspaceDir: workspaceDir,
            };
        } catch (error) {
            await this.cleanupWorkspace(workspaceDir);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Compilation failed",
            };
        }
    }

    private async createWorkspace(
        workspaceDir: string,
        code: string,
        input: string | undefined,
        langConfig: LanguageConfig
    ): Promise<void> {
        await fs.ensureDir(workspaceDir);

        console.log(`📝 Creating workspace for ${langConfig.name}`);

        // For Java, ensure the public class name matches the filename
        let processedCode = code;
        if (langConfig.id === "JAVA") {
            processedCode = this.normalizeJavaClassName(code);
        }

        const codeFileName = this.getCodeFileName(langConfig);
        await fs.writeFile(
            path.join(workspaceDir, codeFileName),
            processedCode,
            "utf8"
        );

        if (input) {
            await fs.writeFile(
                path.join(workspaceDir, "input.txt"),
                input,
                "utf8"
            );
        }
    }

    private normalizeJavaClassName(code: string): string {
        // Replace public class <AnyName> with public class Solution
        // This ensures the class name matches the filename (Solution.java)
        const publicClassRegex = /public\s+class\s+\w+/g;
        return code.replace(publicClassRegex, "public class Solution");
    }

    private getCodeFileName(langConfig: LanguageConfig): string {
        switch (langConfig.id) {
            case "PYTHON":
                return "solution.py";
            case "JAVA":
                return "Solution.java";
            case "CPP":
                return "solution.cpp";
            default:
                return `solution.${langConfig.extension}`;
        }
    }

    private async runInDocker(
        workspaceDir: string,
        langConfig: LanguageConfig,
        timeLimit: number,
        memoryLimit: number
    ): Promise<ExecutionResult> {
        const startTime = Date.now();

        try {
            await this.ensureDockerImage(langConfig.dockerImage);

            console.log(
                `🐳 Creating container for ${langConfig.name} execution...`
            );
            const container = await this.docker.createContainer({
                Image: langConfig.dockerImage,
                Cmd: [],
                WorkingDir: "/workspace",
                HostConfig: {
                    Binds: [`${workspaceDir}:/workspace`],
                    Memory: memoryLimit * 1024 * 1024,
                    CpuShares: 512,
                    NetworkMode: "none",
                    ReadonlyRootfs: false,
                    AutoRemove: false,
                    CapDrop: ["ALL"],
                    SecurityOpt: ["no-new-privileges"],
                },
                Env: ["DEBIAN_FRONTEND=noninteractive", "HOME=/tmp"],
            });

            console.log(`🚀 Starting container...`);
            await container.start();
            console.log(`✅ Container started successfully`);

            const timeoutMs = timeLimit * 1000;
            const result = await this.waitForContainer(container, timeoutMs);

            const endTime = Date.now();
            const runtime = endTime - startTime;
            const memoryUsage = await this.getContainerMemoryUsage(
                container,
                memoryLimit
            );

            const logs = await container.logs({
                stdout: true,
                stderr: true,
                timestamps: false,
            });

            const rawOutput = logs.toString("utf8");

            const jsonStart = rawOutput.indexOf("{");
            const output =
                jsonStart >= 0
                    ? rawOutput.substring(jsonStart).trim()
                    : rawOutput.trim();

            console.log(`🔍 Container raw output:`, rawOutput);
            console.log(`🔍 Container clean output:`, output);
            console.log(`🔍 Container exit code:`, result.exitCode);

            try {
                const runnerResult = JSON.parse(output);
                console.log(`✅ Parsed JSON result:`, runnerResult);
                return {
                    success: runnerResult.success,
                    output: runnerResult.output || "",
                    error: runnerResult.error,
                    runtime: runnerResult.runtime || runtime,
                    memoryUsage: memoryUsage,
                    exitCode: result.exitCode,
                };
            } catch (parseError) {
                const error = parseError as Error;
                console.log(`❌ JSON parse failed:`, error.message);
                console.log(`📋 Raw output:`, JSON.stringify(output));
                return {
                    success: result.exitCode === 0,
                    output: output,
                    error:
                        result.exitCode !== 0 ? "Execution failed" : undefined,
                    runtime,
                    memoryUsage: memoryUsage,
                    exitCode: result.exitCode,
                };
            } finally {
                try {
                    await container.remove({ force: true });
                    console.log(`🗑️ Container removed successfully`);
                } catch (cleanupError) {
                    console.warn(
                        `⚠️ Failed to remove container:`,
                        cleanupError
                    );
                }
            }
        } catch (error) {
            const runtime = Date.now() - startTime;

            console.error(
                `❌ CodeExecutor error for ${langConfig.name}:`,
                error
            );

            if (error instanceof Error && error.message.includes("timeout")) {
                return {
                    success: false,
                    output: "",
                    error: "Time Limit Exceeded",
                    runtime: timeLimit * 1000,
                    memoryUsage: 0,
                    exitCode: -1,
                };
            }

            return {
                success: false,
                output: "",
                error:
                    error instanceof Error
                        ? error.message
                        : "Docker execution failed",
                runtime,
                memoryUsage: 0,
                exitCode: -1,
            };
        }
    }

    private async waitForContainer(
        container: Docker.Container,
        timeoutMs: number
    ): Promise<{ exitCode: number }> {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                container.kill().catch(console.error);
                reject(new Error("Container execution timeout"));
            }, timeoutMs);

            container
                .wait()
                .then((result) => {
                    clearTimeout(timeout);
                    resolve({ exitCode: result.StatusCode });
                })
                .catch((error) => {
                    clearTimeout(timeout);
                    reject(error);
                });
        });
    }

    private async ensureDockerImage(imageName: string): Promise<void> {
        try {
            const image = this.docker.getImage(imageName);
            await image.inspect();
        } catch (error) {
            throw new Error(
                `Docker image '${imageName}' not found. Please build the image first.`
            );
        }
    }

    private async getContainerMemoryUsage(
        container: Docker.Container,
        memoryLimit: number
    ): Promise<number> {
        try {
            const stats = await container.stats({ stream: false });
            if (stats.memory_stats && stats.memory_stats.usage) {
                const memoryUsageMB = stats.memory_stats.usage / (1024 * 1024);
                console.log(
                    `📊 Real memory usage: ${memoryUsageMB.toFixed(2)} MB`
                );
                return Math.round(memoryUsageMB);
            }

            console.warn("⚠️ Memory stats not available, using estimation");
            return this.estimateMemoryUsage(memoryLimit);
        } catch (error) {
            console.error("❌ Failed to get container stats, using estimation");
            return this.estimateMemoryUsage(memoryLimit);
        }
    }

    private estimateMemoryUsage(memoryLimit: number): number {
        const estimated = Math.floor(Math.random() * memoryLimit * 0.5) + 10;
        console.log(`🔮 Estimated memory usage: ${estimated} MB`);
        return estimated;
    }

    async cleanupWorkspace(workspaceDir: string): Promise<void> {
        try {
            await fs.remove(workspaceDir);
            console.log(`🗑️  Workspace cleaned: ${workspaceDir}`);
        } catch (error) {
            console.error("Failed to cleanup workspace:", workspaceDir, error);
        }
    }

    async healthCheck(): Promise<boolean> {
        try {
            await this.docker.ping();
            return true;
        } catch (error) {
            console.error("Docker health check failed:", error);
            return false;
        }
    }

    async getSystemInfo(): Promise<any> {
        try {
            return await this.docker.info();
        } catch (error) {
            console.error("Failed to get Docker system info:", error);
            return null;
        }
    }
}
