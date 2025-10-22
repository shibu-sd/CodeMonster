// Base repository
export { BaseRepository, IBaseRepository } from "./base.repository";

let ProblemRepositoryClass: any = null;
let UserRepositoryClass: any = null;
let SubmissionRepositoryClass: any = null;

try {
    ProblemRepositoryClass = require("./problem.repository").ProblemRepository;
    UserRepositoryClass = require("./user.repository").UserRepository;
    SubmissionRepositoryClass =
        require("./submission.repository").SubmissionRepository;
} catch (error) {
    console.warn("Warning: Could not load repository classes dynamically");
}

export type { ProblemWithRelations, ProblemStats } from "./problem.repository";
export type { UserWithSubmissions, UserProfile } from "./user.repository";
export type {
    SubmissionWithRelations,
    SubmissionStats,
    SubmissionQuery,
} from "./submission.repository";

class RepositoryFactory {
    private static problemRepo: any = null;
    private static userRepo: any = null;
    private static submissionRepo: any = null;

    static getProblemRepository() {
        if (!this.problemRepo && ProblemRepositoryClass) {
            this.problemRepo = new ProblemRepositoryClass();
        }
        return this.problemRepo;
    }

    static getUserRepository() {
        if (!this.userRepo && UserRepositoryClass) {
            this.userRepo = new UserRepositoryClass();
        }
        return this.userRepo;
    }

    static getSubmissionRepository() {
        if (!this.submissionRepo && SubmissionRepositoryClass) {
            this.submissionRepo = new SubmissionRepositoryClass();
        }
        return this.submissionRepo;
    }

    static reset(): void {
        this.problemRepo = null;
        this.userRepo = null;
        this.submissionRepo = null;
    }
}

export { RepositoryFactory };

// Export singleton instances for convenience
export const problemRepository = RepositoryFactory.getProblemRepository();
export const userRepository = RepositoryFactory.getUserRepository();
export const submissionRepository = RepositoryFactory.getSubmissionRepository();
