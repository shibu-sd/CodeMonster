import { prisma } from "../utils/database";

async function fixUserDataConsistency() {
    console.log("🔧 FIXING USER DATA CONSISTENCY ISSUES\n");

    try {
        const users = await prisma.user.findMany({
            select: {
                id: true,
                username: true,
                email: true,
                problemsSolved: true,
                totalSubmissions: true,
                acceptedSubmissions: true,
            },
        });

        console.log(`📊 Processing ${users.length} users\n`);

        for (const user of users) {
            console.log(`👤 Fixing user: ${user.username || user.email}`);

            const [actualUserProblems, actualSubmissions] = await Promise.all([
                prisma.userProblem.findMany({
                    where: { userId: user.id },
                }),
                prisma.submission.findMany({
                    where: { userId: user.id },
                }),
            ]);

            const actualProblemsSolved = [
                ...new Set(
                    actualUserProblems
                        .filter((up) => up.isSolved)
                        .map((up) => up.problemId)
                ),
            ].length;

            const actualTotalSubmissions = actualSubmissions.length;
            const actualAcceptedSubmissions = actualSubmissions.filter(
                (s) => s.status === "ACCEPTED"
            ).length;

            console.log(`   Current stored values:`);
            console.log(`     problemsSolved: ${user.problemsSolved}`);
            console.log(`     totalSubmissions: ${user.totalSubmissions}`);
            console.log(
                `     acceptedSubmissions: ${user.acceptedSubmissions}`
            );

            console.log(`   Correct actual values:`);
            console.log(`     problemsSolved: ${actualProblemsSolved}`);
            console.log(`     totalSubmissions: ${actualTotalSubmissions}`);
            console.log(
                `     acceptedSubmissions: ${actualAcceptedSubmissions}`
            );

            const needsCorrection =
                user.problemsSolved !== actualProblemsSolved ||
                user.totalSubmissions !== actualTotalSubmissions ||
                user.acceptedSubmissions !== actualAcceptedSubmissions;

            if (needsCorrection) {
                console.log(`   🔧 Applying corrections...`);

                await prisma.user.update({
                    where: { id: user.id },
                    data: {
                        problemsSolved: actualProblemsSolved,
                        totalSubmissions: actualTotalSubmissions,
                        acceptedSubmissions: actualAcceptedSubmissions,
                    },
                });

                console.log(`   ✅ Updated user statistics successfully!`);
            } else {
                console.log(`   ✅ User statistics are already correct!`);
            }

            const problemIds = actualUserProblems.map((up) => up.problemId);
            const uniqueProblemIds = [...new Set(problemIds)];

            if (problemIds.length !== uniqueProblemIds.length) {
                console.log(
                    `   🧹 Cleaning up duplicate userProblem entries...`
                );

                const seen = new Set();
                const duplicateIds: string[] = [];

                actualUserProblems.forEach((up) => {
                    if (seen.has(up.problemId)) {
                        duplicateIds.push(up.id);
                    } else {
                        seen.add(up.problemId);
                    }
                });

                if (duplicateIds.length > 0) {
                    await prisma.userProblem.deleteMany({
                        where: {
                            id: { in: duplicateIds },
                        },
                    });
                    console.log(
                        `   ✅ Removed ${duplicateIds.length} duplicate userProblem entries`
                    );
                }
            }

            console.log("\n" + "─".repeat(60) + "\n");
        }

        console.log("🧹 Checking for any cleanup needed...");
        const totalUserProblems = await prisma.userProblem.count();
        console.log(`   Total userProblem entries: ${totalUserProblems}`);

        console.log("   ✅ UserProblem entries check completed");

        console.log("\n🎉 User data consistency fix completed successfully!");
    } catch (error) {
        console.error("❌ Error fixing user data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    fixUserDataConsistency();
}

export { fixUserDataConsistency };
