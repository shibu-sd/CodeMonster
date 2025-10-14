import { PrismaClient } from "@prisma/client";
import { DatabaseError } from "../middleware/errorHandler";
import { prisma } from "../utils/database";
import { SimpleCache } from "../utils/helpers";
import { config } from "../config";

// Generic repository interface
export interface IBaseRepository<T, K> {
    findById(id: K): Promise<T | null>;
    findMany(filter?: Partial<T>, options?: any): Promise<T[]>;
    create(data: Partial<T>): Promise<T>;
    update(id: K, data: Partial<T>): Promise<T>;
    delete(id: K): Promise<void>;
    count(filter?: Partial<T>): Promise<number>;
    exists(id: K): Promise<boolean>;
}

// Generic repository base class
export abstract class BaseRepository<T, K> implements IBaseRepository<T, K> {
    protected prisma: PrismaClient;
    protected modelName: string;
    protected cache: SimpleCache<T>;
    protected cacheKeyPrefix: string;

    constructor(modelName: string) {
        this.prisma = prisma;
        this.modelName = modelName;
        this.cacheKeyPrefix = modelName.toLowerCase();
        this.cache = new SimpleCache<T>(config.cache.ttl, config.cache.maxSize);
    }

    protected getModel(): any {
        if (!(this.prisma as any)[this.modelName]) {
            throw new DatabaseError(`Model ${this.modelName} not found`);
        }
        return (this.prisma as any)[this.modelName];
    }

    async findById(id: K, include?: any): Promise<T | null> {
        try {
            const cacheKey = `${this.modelName}:${id}:${JSON.stringify(
                include || {}
            )}`;

            let result = this.cache.get(cacheKey);
            if (result !== undefined) {
                return result as T;
            }

            const model = this.getModel();
            result = await model.findUnique({
                where: { id },
                include,
            });

            if (result) {
                this.cache.set(cacheKey, result);
            }

            return result as T | null;
        } catch (error) {
            throw new DatabaseError(
                `Failed to find ${this.modelName} by ID: ${
                    (error as Error).message
                }`
            );
        }
    }

    async findMany(
        filter: Partial<T> = {},
        options: {
            include?: any;
            orderBy?: any;
            skip?: number;
            take?: number;
            useCache?: boolean;
        } = {}
    ): Promise<T[]> {
        try {
            const { include, orderBy, skip, take, useCache = false } = options;

            if (useCache) {
                const cacheKey = `${this.modelName}:many:${JSON.stringify({
                    filter,
                    options,
                })}`;
                let result = this.cache.get(cacheKey);
                if (result) {
                    return Array.isArray(result) ? result : [];
                }
            }

            const model = this.getModel();
            const result = await model.findMany({
                where: filter,
                include,
                orderBy,
                skip,
                take,
            });

            if (useCache) {
                const cacheKey = `${this.modelName}:many:${JSON.stringify({
                    filter,
                    options,
                })}`;
                this.cache.set(cacheKey, result as T);
            }

            return result;
        } catch (error) {
            throw new DatabaseError(
                `Failed to find ${this.modelName} records: ${
                    (error as Error).message
                }`
            );
        }
    }

    async create(data: Partial<T>, include?: any): Promise<T> {
        try {
            const model = this.getModel();
            const result = await model.create({
                data,
                include,
            });

            this.invalidateCache();

            return result;
        } catch (error) {
            throw new DatabaseError(
                `Failed to create ${this.modelName}: ${
                    (error as Error).message
                }`
            );
        }
    }

    async update(id: K, data: Partial<T>, include?: any): Promise<T> {
        try {
            const model = this.getModel();
            const result = await model.update({
                where: { id },
                data,
                include,
            });

            this.invalidateCacheForId(id);

            return result;
        } catch (error) {
            if ((error as any).code === "P2025") {
                throw new DatabaseError(`${this.modelName} not found`);
            }
            throw new DatabaseError(
                `Failed to update ${this.modelName}: ${
                    (error as Error).message
                }`
            );
        }
    }

    async delete(id: K): Promise<void> {
        try {
            const model = this.getModel();
            await model.delete({
                where: { id },
            });

            this.invalidateCacheForId(id);
        } catch (error) {
            if ((error as any).code === "P2025") {
                throw new DatabaseError(`${this.modelName} not found`);
            }
            throw new DatabaseError(
                `Failed to delete ${this.modelName}: ${
                    (error as Error).message
                }`
            );
        }
    }

    async count(filter: Partial<T> = {}): Promise<number> {
        try {
            const model = this.getModel();
            return await model.count({
                where: filter,
            });
        } catch (error) {
            throw new DatabaseError(
                `Failed to count ${this.modelName} records: ${
                    (error as Error).message
                }`
            );
        }
    }

    async exists(id: K): Promise<boolean> {
        try {
            const cacheKey = `${this.modelName}:exists:${id}`;

            let result = this.cache.get(cacheKey);
            if (result !== undefined) {
                return Boolean(result);
            }

            const model = this.getModel();
            const exists = await model.findUnique({
                where: { id },
                select: { id: true },
            });

            const existsBool = !!exists;
            this.cache.set(cacheKey, existsBool as unknown as T);

            return existsBool;
        } catch (error) {
            throw new DatabaseError(
                `Failed to check ${this.modelName} existence: ${
                    (error as Error).message
                }`
            );
        }
    }

    async findFirst(
        filter: Partial<T> = {},
        options: {
            include?: any;
            orderBy?: any;
            useCache?: boolean;
        } = {}
    ): Promise<T | null> {
        try {
            const { include, orderBy, useCache = false } = options;

            if (useCache) {
                const cacheKey = `${this.modelName}:first:${JSON.stringify({
                    filter,
                    options,
                })}`;
                let result = this.cache.get(cacheKey);
                if (result) {
                    return result;
                }
            }

            const model = this.getModel();
            const result = await model.findFirst({
                where: filter,
                include,
                orderBy,
            });

            if (useCache) {
                const cacheKey = `${this.modelName}:first:${JSON.stringify({
                    filter,
                    options,
                })}`;
                if (result) {
                    this.cache.set(cacheKey, result);
                }
            }

            return result;
        } catch (error) {
            throw new DatabaseError(
                `Failed to find first ${this.modelName}: ${
                    (error as Error).message
                }`
            );
        }
    }

    async findUnique(
        where: any,
        include?: any,
        useCache: boolean = true
    ): Promise<T | null> {
        try {
            const cacheKey = `${this.modelName}:unique:${JSON.stringify({
                where,
                include,
            })}`;

            if (useCache) {
                let result = this.cache.get(cacheKey);
                if (result) {
                    return result;
                }
            }

            const model = this.getModel();
            const result = await model.findUnique({
                where,
                include,
            });

            if (useCache && result) {
                this.cache.set(cacheKey, result);
            }

            return result;
        } catch (error) {
            throw new DatabaseError(
                `Failed to find unique ${this.modelName}: ${
                    (error as Error).message
                }`
            );
        }
    }

    async upsert(
        where: any,
        createData: Partial<T>,
        updateData: Partial<T>,
        include?: any
    ): Promise<T> {
        try {
            const model = this.getModel();
            const result = await model.upsert({
                where,
                create: createData,
                update: updateData,
                include,
            });

            this.invalidateCache();

            return result;
        } catch (error) {
            throw new DatabaseError(
                `Failed to upsert ${this.modelName}: ${
                    (error as Error).message
                }`
            );
        }
    }

    async createMany(data: Partial<T>[]): Promise<{ count: number }> {
        try {
            const model = this.getModel();
            const result = await model.createMany({
                data: data as any[],
            });

            this.invalidateCache();

            return result;
        } catch (error) {
            throw new DatabaseError(
                `Failed to create many ${this.modelName}: ${
                    (error as Error).message
                }`
            );
        }
    }

    async updateMany(
        filter: Partial<T>,
        data: Partial<T>
    ): Promise<{ count: number }> {
        try {
            const model = this.getModel();
            const result = await model.updateMany({
                where: filter,
                data,
            });

            this.invalidateCache();

            return result;
        } catch (error) {
            throw new DatabaseError(
                `Failed to update many ${this.modelName}: ${
                    (error as Error).message
                }`
            );
        }
    }

    async deleteMany(filter: Partial<T>): Promise<{ count: number }> {
        try {
            const model = this.getModel();
            const result = await model.deleteMany({
                where: filter,
            });

            this.invalidateCache();

            return result;
        } catch (error) {
            throw new DatabaseError(
                `Failed to delete many ${this.modelName}: ${
                    (error as Error).message
                }`
            );
        }
    }

    protected invalidateCache(): void {
        this.cache.clear();
    }

    protected invalidateCacheForId(id: K): void {
        const idStr = String(id);
        const keysToCheck = [
            `${this.cacheKeyPrefix}:${idStr}:`,
            `${this.cacheKeyPrefix}:exists:${idStr}`,
            `${this.cacheKeyPrefix}:unique:`,
            `${this.cacheKeyPrefix}:first:`,
            `${this.cacheKeyPrefix}:many:`,
            `${this.cacheKeyPrefix}:identifier:`,
        ];

        try {
            const cacheMap = (this.cache as any).cache;
            if (cacheMap && typeof cacheMap.delete === "function") {
                for (const [key] of cacheMap) {
                    if (typeof key === "string") {
                        if (
                            keysToCheck.some((pattern) => key.includes(pattern))
                        ) {
                            cacheMap.delete(key);
                        }
                    }
                }
            } else {
                console.warn(
                    `Unable to perform targeted cache invalidation for ${this.modelName}:${id}`
                );
            }
        } catch (error) {
            console.error(
                `Error during cache invalidation for ${this.modelName}:${id}:`,
                error
            );
            this.cache.clear();
        }
    }

    protected invalidateCacheForPattern(pattern: string): void {
        try {
            const cacheMap = (this.cache as any).cache;
            if (cacheMap && typeof cacheMap.delete === "function") {
                for (const [key] of cacheMap) {
                    if (typeof key === "string" && key.includes(pattern)) {
                        cacheMap.delete(key);
                    }
                }
            }
        } catch (error) {
            console.error(
                `Error during pattern-based cache invalidation:`,
                error
            );
        }
    }

    async transaction<R>(
        operations: (tx: PrismaClient) => Promise<R>
    ): Promise<R> {
        try {
            return await this.prisma.$transaction(async (tx) => {
                return await operations(tx as PrismaClient);
            });
        } catch (error) {
            throw new DatabaseError(
                `Transaction failed: ${(error as Error).message}`
            );
        }
    }

    async rawQuery(query: string, parameters?: any[]): Promise<any> {
        try {
            if (parameters && parameters.length > 0) {
                return await this.prisma
                    .$queryRaw`SELECT * FROM (${query}) as query WHERE ${parameters.join(
                    ", "
                )}`;
            } else {
                return await this.prisma.$queryRaw`${query}`;
            }
        } catch (error) {
            throw new DatabaseError(
                `Raw query failed: ${(error as Error).message}`
            );
        }
    }
}
