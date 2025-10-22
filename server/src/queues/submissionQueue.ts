import { Queue, Job } from "bullmq";
import { Redis } from "ioredis";
import { JudgeJobData, JudgeJobResult } from "../types";

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
            removeOnComplete: { count: 50 }, // Keep last 50 completed jobs
            removeOnFail: { count: 20 }, // Keep last 20 failed jobs
            attempts: 2, // Retry failed jobs once
            backoff: {
                type: "exponential",
                delay: 2000,
            },
        },
    }
);

submissionQueue.on("error", (err: Error) => {
    console.error("❌ Queue error:", err);
});

export async function addSubmissionJob(
    jobData: JudgeJobData
): Promise<Job<JudgeJobData, JudgeJobResult>> {
    const job = await submissionQueue.add("judge-submission", jobData, {
        priority: 1, // Higher priority for newer submissions
        delay: 0, // Process immediately
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
    console.log("🛑 Shutting down submission queue...");
    await submissionQueue.close();
    await connection.disconnect();
    console.log("✅ Submission queue shut down gracefully");
    process.exit(0);
});

export { connection as redisConnection };
