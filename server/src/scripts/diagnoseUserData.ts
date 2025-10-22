import { prisma } from "../utils/database";

async function diagnoseUserData() {
    console.log("🔍 DIAGNOSING USER DATA INCONSISTENCIES\n");

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

        console.log(`📊 Found ${users.length} users in the database\n`);

        for (const user of users) {
            console.log(`👤 USER: ${user.username || user.email}`);
            console.log(`   ID: ${user.id}`);
            console.log(`   Stored problemsSolved: ${user.problemsSolved}`);
            console.log(`   Stored totalSubmissions: ${user.totalSubmissions}`);
            console.log(
                `   Stored acceptedSubmissions: ${user.acceptedSubmissions}`
            );

            const userProblems = await prisma.userProblem.findMany({
                where: { userId: user.id },
                include: {
                    problem: {
                        select: {
                            id: true,
                            title: true,
                        },
                    },
                },
            });

            console.log(`   Total userProblem entries: ${userProblems.length}`);

            const problemIds = userProblems.map((up) => up.problemId);
            const uniqueProblemIds = [...new Set(problemIds)];
            const duplicates = problemIds.length - uniqueProblemIds.length;

            if (duplicates > 0) {
                console.log(`   ⚠️  FOUND ${duplicates} DUPLICATE ENTRIES!`);

                const problemCounts: Record<string, number> = {};
                problemIds.forEach((id) => {
                    problemCounts[id] = (problemCounts[id] || 0) + 1;
                });

                Object.entries(problemCounts).forEach(([problemId, count]) => {
                    if (count > 1) {
                        const problem = userProblems.find(
                            (up) => up.problemId === problemId
                        )?.problem;
                        console.log(
                            `      - Problem "${problem?.title}" (ID: ${problemId}): ${count} entries`
                        );
                    }
                });
            }

            const solvedProblems = userProblems.filter((up) => up.isSolved);
            const uniqueSolvedProblemIds = [
                ...new Set(solvedProblems.map((up) => up.problemId)),
            ];

            console.log(
                `   Solved problems (raw count): ${solvedProblems.length}`
            );
            console.log(
                `   Unique solved problems: ${uniqueSolvedProblemIds.length}`
            );

            if (user.problemsSolved !== uniqueSolvedProblemIds.length) {
                console.log(`   🚨 MISMATCH DETECTED!`);
                console.log(`      Expected: ${uniqueSolvedProblemIds.length}`);
                console.log(`      Stored: ${user.problemsSolved}`);
                console.log(
                    `      Difference: ${
                        user.problemsSolved - uniqueSolvedProblemIds.length
                    }`
                );

                console.log(`   📋 Solved problems list:`);
                solvedProblems.forEach((up) => {
                    console.log(
                        `      - "${up.problem.title}" (ID: ${up.problemId})`
                    );
                });
            }

            const submissions = await prisma.submission.findMany({
                where: { userId: user.id },
                select: {
                    id: true,
                    status: true,
                    problemId: true,
                },
            });

            const acceptedSubmissions = submissions.filter(
                (s) => s.status === "ACCEPTED"
            );
            const uniqueAcceptedProblemIds = [
                ...new Set(acceptedSubmissions.map((s) => s.problemId)),
            ];

            console.log(`   Total submissions: ${submissions.length}`);
            console.log(
                `   Accepted submissions: ${acceptedSubmissions.length}`
            );
            console.log(
                `   Unique problems with accepted submissions: ${uniqueAcceptedProblemIds.length}`
            );

            if (user.totalSubmissions !== submissions.length) {
                console.log(`   🚨 SUBMISSION COUNT MISMATCH!`);
                console.log(`      Expected: ${submissions.length}`);
                console.log(`      Stored: ${user.totalSubmissions}`);
            }

            if (user.acceptedSubmissions !== acceptedSubmissions.length) {
                console.log(`   🚨 ACCEPTED SUBMISSIONS MISMATCH!`);
                console.log(`      Expected: ${acceptedSubmissions.length}`);
                console.log(`      Stored: ${user.acceptedSubmissions}`);
            }

            console.log("\n" + "─".repeat(60) + "\n");
        }
    } catch (error) {
        console.error("❌ Error diagnosing user data:", error);
    } finally {
        await prisma.$disconnect();
    }
}

if (require.main === module) {
    diagnoseUserData();
}

export { diagnoseUserData };
