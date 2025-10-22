import { PaginationQuery, ApiResponse } from "../types";
import { config } from "../config";

export const getPaginationParams = (query: PaginationQuery) => {
    const page = Math.max(1, parseInt(query.page?.toString() || "1"));
    const limit = Math.min(
        config.pagination.maxLimit,
        Math.max(
            1,
            parseInt(
                query.limit?.toString() ||
                    config.pagination.defaultLimit.toString()
            )
        )
    );
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "createdAt";
    const sortOrder = query.sortOrder || "desc";

    return {
        page,
        limit,
        skip,
        sortBy,
        sortOrder,
    };
};

export const createPaginationResponse = <T>(
    data: T[],
    totalCount: number,
    page: number,
    limit: number
) => {
    const totalPages = Math.ceil(totalCount / limit);
    const hasNext = page < totalPages;
    const hasPrev = page > 1;

    return {
        data,
        pagination: {
            currentPage: page,
            totalPages,
            totalItems: totalCount,
            hasNext,
            hasPrev,
        },
    };
};

export const createSuccessResponse = <T>(
    data: T,
    message?: string
): ApiResponse<T> => {
    return {
        success: true,
        data,
        message,
    };
};

export const createErrorResponse = (
    error: string,
    message?: string
): ApiResponse => {
    return {
        success: false,
        error,
        message,
    };
};

export const generateSlug = (title: string): string => {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim();
};

export const sanitizeString = (
    str: string,
    options?: {
        maxLength?: number;
        allowHtml?: boolean;
        trim?: boolean;
    }
): string => {
    if (typeof str !== "string") return str;

    let sanitized = str;

    if (options?.trim !== false) {
        sanitized = sanitized.trim();
    }

    if (!options?.allowHtml) {
        sanitized = sanitized.replace(/<[^>]*>/g, "");
    }

    if (options?.maxLength) {
        sanitized = sanitized.substring(0, options.maxLength);
    }

    return sanitized;
};

export const sanitizeArray = (
    arr: any[],
    validator?: (item: any) => boolean
): any[] => {
    if (!Array.isArray(arr)) return arr;

    let sanitized = arr.filter((item) => item != null);

    if (validator) {
        sanitized = sanitized.filter(validator);
    }

    return sanitized;
};

export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

export const isValidUsername = (username: string): boolean => {
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
    return usernameRegex.test(username);
};

export const isValidLanguage = (language: string): boolean => {
    const validLanguages = [
        "JAVASCRIPT",
        "PYTHON",
        "JAVA",
        "CPP",
        "C",
        "TYPESCRIPT",
    ];
    return validLanguages.includes(language.toUpperCase());
};

export const isValidDifficulty = (difficulty: string): boolean => {
    const validDifficulties = ["EASY", "MEDIUM", "HARD"];
    return validDifficulties.includes(difficulty.toUpperCase());
};

export const isValidCodeSize = (
    code: string,
    maxSize: number = config.upload.maxCodeLength
): boolean => {
    return (
        typeof code === "string" && code.length > 0 && code.length <= maxSize
    );
};

export const isValidId = (id: string): boolean => {
    return typeof id === "string" && id.length > 0 && id.length <= 50;
};

export const withTimeout = <T>(
    promise: Promise<T>,
    timeoutMs: number
): Promise<T> => {
    return Promise.race([
        promise,
        new Promise<never>((_, reject) =>
            setTimeout(
                () =>
                    reject(
                        new Error(`Operation timed out after ${timeoutMs}ms`)
                    ),
                timeoutMs
            )
        ),
    ]);
};

export const retry = async <T>(
    fn: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 1000
): Promise<T> => {
    let lastError: Error;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt === maxAttempts) {
                throw lastError;
            }

            const delay = delayMs * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
        }
    }

    throw lastError!;
};

export const debounce = <T extends (...args: any[]) => any>(
    func: T,
    delayMs: number
): ((...args: Parameters<T>) => void) => {
    let timeoutId: NodeJS.Timeout;

    return (...args: Parameters<T>) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delayMs);
    };
};

export const throttle = <T extends (...args: any[]) => any>(
    func: T,
    delayMs: number
): ((...args: Parameters<T>) => void) => {
    let isThrottled = false;

    return (...args: Parameters<T>) => {
        if (!isThrottled) {
            func(...args);
            isThrottled = true;
            setTimeout(() => {
                isThrottled = false;
            }, delayMs);
        }
    };
};

export class SimpleCache<T> {
    private cache = new Map<string, { value: T; expiresAt: number }>();

    constructor(
        private ttlMs: number = config.cache.ttl,
        private maxSize: number = config.cache.maxSize
    ) {}

    set(key: string, value: T): void {
        this.cleanup();

        if (this.cache.size >= this.maxSize) {
            const firstKey = this.cache.keys().next().value;
            if (firstKey) {
                this.cache.delete(firstKey);
            }
        }

        this.cache.set(key, {
            value,
            expiresAt: Date.now() + this.ttlMs,
        });
    }

    get(key: string): T | undefined {
        const entry = this.cache.get(key);

        if (!entry) {
            return undefined;
        }

        if (Date.now() > entry.expiresAt) {
            this.cache.delete(key);
            return undefined;
        }

        return entry.value;
    }

    has(key: string): boolean {
        return this.get(key) !== undefined;
    }

    delete(key: string): boolean {
        return this.cache.delete(key);
    }

    clear(): void {
        this.cache.clear();
    }

    size(): number {
        this.cleanup();
        return this.cache.size;
    }

    private cleanup(): void {
        const now = Date.now();
        const keysToDelete: string[] = [];
        this.cache.forEach((entry, key) => {
            if (now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        });
        keysToDelete.forEach((key) => this.cache.delete(key));
    }
}

export class AsyncBuffer<T> {
    private buffer: T[] = [];
    private processing = false;

    constructor(
        private processor: (items: T[]) => Promise<void>,
        private maxSize: number = 10,
        private flushInterval: number = 1000
    ) {
        setInterval(() => {
            if (this.buffer.length > 0) {
                this.flush();
            }
        }, this.flushInterval);
    }

    add(item: T): void {
        this.buffer.push(item);

        if (this.buffer.length >= this.maxSize) {
            this.flush();
        }
    }

    async flush(): Promise<void> {
        if (this.processing || this.buffer.length === 0) {
            return;
        }

        this.processing = true;
        const items = this.buffer.splice(0);

        try {
            await this.processor(items);
        } catch (error) {
            console.error("Error processing buffer:", error);
            this.buffer.unshift(...items);
        } finally {
            this.processing = false;
        }
    }
}

export const measureTime = <T>(
    fn: () => T | Promise<T>
): Promise<{ result: T; durationMs: number }> => {
    return new Promise(async (resolve, reject) => {
        const startTime = Date.now();

        try {
            const result = await fn();
            const durationMs = Date.now() - startTime;
            resolve({ result, durationMs });
        } catch (error) {
            const durationMs = Date.now() - startTime;
            reject({ error, durationMs });
        }
    });
};

export const safeJsonParse = <T>(str: string, fallback: T): T => {
    try {
        return JSON.parse(str);
    } catch {
        return fallback;
    }
};

export const generateRandomString = (length: number = 10): string => {
    const chars =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let result = "";

    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return result;
};

export const deepFreeze = <T>(object: T): T => {
    Object.getOwnPropertyNames(object).forEach((name) => {
        const value = (object as any)[name];

        if (value && typeof value === "object" && !Object.isFrozen(value)) {
            deepFreeze(value);
        }
    });

    return Object.freeze(object);
};
