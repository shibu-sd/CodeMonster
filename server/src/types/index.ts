// Re-export Prisma generated types
export * from '@prisma/client';

// Additional custom types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface ProblemFilters {
  difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
  tags?: string[];
  search?: string;
}

export interface SubmissionRequest {
  problemId: string;
  language: 'JAVASCRIPT' | 'PYTHON' | 'JAVA' | 'CPP' | 'C' | 'TYPESCRIPT';
  code: string;
}

export interface TestCaseResult {
  input: string;
  expectedOutput: string;
  actualOutput?: string;
  passed: boolean;
  error?: string;
  runtime?: number;
  memoryUsage?: number;
}

export interface JudgeResult {
  status: 'ACCEPTED' | 'WRONG_ANSWER' | 'TIME_LIMIT_EXCEEDED' | 'MEMORY_LIMIT_EXCEEDED' | 'RUNTIME_ERROR' | 'COMPILATION_ERROR' | 'INTERNAL_ERROR';
  testCasesPassed: number;
  totalTestCases: number;
  runtime?: number;
  memoryUsage?: number;
  errorMessage?: string;
  testCaseResults?: TestCaseResult[];
}

export interface UserStats {
  problemsSolved: number;
  totalSubmissions: number;
  acceptedSubmissions: number;
  acceptanceRate: number;
  easyProblemsCount: number;
  mediumProblemsCount: number;
  hardProblemsCount: number;
}

// Clerk user data structure
export interface ClerkUser {
  id: string;
  emailAddresses: Array<{
    emailAddress: string;
    id: string;
  }>;
  firstName?: string;
  lastName?: string;
  username?: string;
  profileImageUrl?: string;
}
