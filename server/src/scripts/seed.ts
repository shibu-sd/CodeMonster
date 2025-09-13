import { connectDatabase, disconnectDatabase } from "../utils/database";
import { seedSampleProblems, seedTestUser } from "../utils/seedData";

async function runSeed() {
    try {
        console.log("🌱 Starting database seeding...");

        await connectDatabase();

        await seedSampleProblems();

        await seedTestUser();

        console.log("🎉 Database seeding completed successfully!");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
        process.exit(1);
    } finally {
        await disconnectDatabase();
    }
}

if (require.main === module) {
    runSeed();
}

export { runSeed };
