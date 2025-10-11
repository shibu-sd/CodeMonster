import { prisma } from "../utils/database";

async function recalculateAcceptanceRates() {
    console.log("🔄 Starting acceptance rate recalculation...\n");

    console.log("📊 Recalculating problem acceptance rates...");
    const problems = await prisma.problem.findMany({
        select: {
            id: true,
            title: true,
            totalSubmissions: true,
            acceptedSubmissions: true,
        },
    });

    for (const problem of problems) {
        const acceptanceRate =
            problem.totalSubmissions > 0
                ? problem.acceptedSubmissions / problem.totalSubmissions
                : 0;

        await prisma.problem.update({
            where: { id: problem.id },
            data: { acceptanceRate },
        });

        console.log(
            `  ✅ ${problem.title}: ${problem.acceptedSubmissions}/${
                problem.totalSubmissions
            } = ${(acceptanceRate * 100).toFixed(1)}%`
        );
    }

    console.log(`\n✅ Updated ${problems.length} problems\n`);

    console.log("👥 Verifying user stats...");
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            totalSubmissions: true,
            acceptedSubmissions: true,
        },
    });

    let usersFixed = 0;
    for (const user of users) {
        const actualSubmissions = await prisma.submission.count({
            where: { userId: user.id },
        });

        const actualAccepted = await prisma.submission.count({
            where: {
                userId: user.id,
                status: "ACCEPTED",
            },
        });

        if (
            user.totalSubmissions !== actualSubmissions ||
            user.acceptedSubmissions !== actualAccepted
        ) {
            await prisma.user.update({
                where: { id: user.id },
                data: {
                    totalSubmissions: actualSubmissions,
                    acceptedSubmissions: actualAccepted,
                },
            });

            console.log(
                `  ✅ Fixed ${user.email}: Total ${user.totalSubmissions} → ${actualSubmissions}, Accepted ${user.acceptedSubmissions} → ${actualAccepted}`
            );
            usersFixed++;
        }
    }

    if (usersFixed === 0) {
        console.log("  ✅ All user stats are correct");
    } else {
        console.log(`\n✅ Fixed ${usersFixed} users`);
    }

    console.log("\n🎉 Acceptance rate recalculation complete!");
}

recalculateAcceptanceRates()
    .then(() => {
        console.log("\n✨ Script completed successfully");
        process.exit(0);
    })
    .catch((error) => {
        console.error("\n❌ Error:", error);
        process.exit(1);
    });
