import { Queue, Worker, Job } from "bullmq";
import { Redis } from "ioredis";
import { JudgeJobData, JudgeJobResult, JudgeResult } from "../core/types";
import { JudgeService } from "../core/JudgeService";

const redisConfig = {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379"),
    maxRetriesPerRequest: null,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true,
};

const connection = new Redis(redisConfig);

export const submissionQueue = new Queue<JudgeJobData, JudgeJobResult>(
    "submission-judge",
    {
        connection,
        defaultJobOptions: {
            removeOnComplete: { count: 50 },
            removeOnFail: { count: 20 },
            attempts: 2,
            backoff: {
                type: "exponential",
                delay: 2000,
            },
        },
    }
);

const judgeService = new JudgeService();

export const judgeWorker = new Worker<JudgeJobData, JudgeJobResult>(
    "submission-judge",
    async (job: Job<JudgeJobData, JudgeJobResult>) => {
        const { submissionId, code, language, problemId, userId, testCases } =
            job.data;

        console.log(
            `🔄 Processing submission ${submissionId} for user ${userId}`
        );

        try {
            await job.updateProgress(10);

            const result = await judgeService.judgeSubmission({
                id: submissionId,
                code,
                language,
                problemId,
                userId,
                testCases,
            });

            await job.updateProgress(90);

            console.log(
                `✅ Completed submission ${submissionId} - Status: ${result.status}`
            );

            const jobResult: JudgeJobResult = {
                submissionId,
                result,
            };

            await job.updateProgress(100);
            return jobResult;
        } catch (error) {
            console.error(
                `❌ Failed to process submission ${submissionId}:`,
                error
            );

            const errorResult: JudgeResult = {
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

            return {
                submissionId,
                result: errorResult,
            };
        }
    },
    {
        connection,
        concurrency: parseInt(process.env.MAX_CONCURRENT_JOBS || "3"),
        removeOnComplete: { count: 50 },
        removeOnFail: { count: 20 },
    }
);

judgeWorker.on("completed", async (job: Job, result: JudgeJobResult) => {
    console.log(`🎉 Job ${job.id} completed:`, {
        submissionId: result.submissionId,
        status: result.result.status,
        passed: result.result.testCasesPassed,
        total: result.result.totalTestCases,
    });

    await sendResultToServer(result);
});

judgeWorker.on("failed", (job: Job | undefined, err: Error) => {
    console.error(`💥 Job ${job?.id} failed:`, err.message);
});

judgeWorker.on("progress", (job: Job, progress: any) => {
    console.log(`📊 Job ${job.id} progress:`, progress);
});

judgeWorker.on("stalled", (jobId: string) => {
    console.warn(`⏱️ Job ${jobId} stalled`);
});

submissionQueue.on("error", (err: Error) => {
    console.error("❌ Queue error:", err);
});

export async function addSubmissionJob(
    jobData: JudgeJobData
): Promise<Job<JudgeJobData, JudgeJobResult>> {
    const job = await submissionQueue.add("judge-submission", jobData, {
        priority: 1,
        delay: 0,
    });

    console.log(
        `📥 Added submission job ${job.id} for submission ${jobData.submissionId}`
    );
    return job;
}

export async function getJobStatus(jobId: string): Promise<any> {
    const job = await submissionQueue.getJob(jobId);
    if (!job) {
        return null;
    }

    return {
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress,
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue,
    };
}

export async function getQueueStats(): Promise<any> {
    const waiting = await submissionQueue.getWaiting();
    const active = await submissionQueue.getActive();
    const completed = await submissionQueue.getCompleted();
    const failed = await submissionQueue.getFailed();

    return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        total:
            waiting.length + active.length + completed.length + failed.length,
    };
}

process.on("SIGINT", async () => {
    console.log("🛑 Shutting down judge worker...");
    await judgeWorker.close();
    await submissionQueue.close();
    await connection.disconnect();
    console.log("✅ Judge worker shut down gracefully");
    process.exit(0);
});

async function sendResultToServer(result: JudgeJobResult): Promise<void> {
    try {
        const serverUrl = process.env.SERVER_URL || "http://localhost:5000";
        const endpoint = `${serverUrl}/api/judge/results`;

        console.log(`🔗 Sending webhook to: ${endpoint}`);
        console.log(`📝 Payload:`, JSON.stringify(result, null, 2));

        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(result),
        });

        console.log(
            `📊 Response status: ${response.status} ${response.statusText}`
        );

        if (!response.ok) {
            const responseText = await response.text();
            console.log(`📄 Response body:`, responseText);
            throw new Error(
                `Server responded with ${response.status}: ${response.statusText} - ${responseText}`
            );
        }

        const responseData = await response.json();
        console.log(`✅ Server response:`, responseData);
        console.log(
            `📤 Successfully sent result for submission ${result.submissionId} to server`
        );
    } catch (error) {
        console.error(`❌ Failed to send result to server:`, error);
        if (error instanceof Error) {
            console.error(`❌ Error details:`, error.message);
            console.error(`❌ Error stack:`, error.stack);
        }
    }
}

export { connection as redisConnection };
