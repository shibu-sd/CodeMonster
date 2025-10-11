import { prisma } from "../utils/database";

export class SubmissionCleanupService {
    private static readonly MAX_SUBMISSIONS_PER_USER = 15;

    static async cleanupUserSubmissions(userId: string): Promise<void> {
        try {
            const userSubmissions = await prisma.submission.findMany({
                where: { userId },
                orderBy: { submittedAt: "desc" },
                select: { id: true },
            });

            if (userSubmissions.length > this.MAX_SUBMISSIONS_PER_USER) {
                const submissionsToKeep = userSubmissions.slice(
                    0,
                    this.MAX_SUBMISSIONS_PER_USER
                );
                const submissionIdsToKeep = submissionsToKeep.map((s) => s.id);

                const deleteResult = await prisma.submission.deleteMany({
                    where: {
                        userId,
                        id: {
                            notIn: submissionIdsToKeep,
                        },
                    },
                });

                console.log(
                    `🧹 Cleaned up ${deleteResult.count} old submissions for user ${userId}`
                );
            }
        } catch (error) {
            console.error(
                `Error cleaning up submissions for user ${userId}:`,
                error
            );
        }
    }

    static async cleanupAllUserSubmissions(): Promise<void> {
        try {
            const users = await prisma.user.findMany({
                select: { id: true },
            });

            console.log(
                `🧹 Starting submission cleanup for ${users.length} users...`
            );

            for (const user of users) {
                await this.cleanupUserSubmissions(user.id);
            }

            console.log("✅ Submission cleanup completed for all users");
        } catch (error) {
            console.error("Error during global submission cleanup:", error);
        }
    }
}
