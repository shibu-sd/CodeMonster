import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { judgeWorker } from "./queue/worker";
import { createJudgeAPI } from "./api/routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
    res.json({
        service: "CodeMonster Judge Service",
        status: "healthy",
        timestamp: new Date().toISOString(),
        version: "1.0.0",
    });
});

app.use("/api", createJudgeAPI());

async function startJudgeService() {
    try {
        console.log("🚀 Starting CodeMonster Judge Service...");

        console.log("⚡ Initializing judge worker...");

        app.listen(PORT, () => {
            console.log(`✅ Judge Service running on port ${PORT}`);
            console.log(`🔍 Health check: http://localhost:${PORT}/health`);
            console.log(`📊 API endpoints: http://localhost:${PORT}/api`);
        });

        process.on("SIGINT", async () => {
            console.log("🛑 Shutting down Judge Service...");
            await judgeWorker.close();
            console.log("✅ Judge Service shut down gracefully");
            process.exit(0);
        });
    } catch (error) {
        console.error("❌ Failed to start Judge Service:", error);
        process.exit(1);
    }
}

startJudgeService().catch(console.error);
