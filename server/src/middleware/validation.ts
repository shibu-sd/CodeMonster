import { Request, Response, NextFunction } from "express";
import { ValidationError } from "./errorHandler";
import { config } from "../config";

export interface ValidationRule {
    field: string;
    required?: boolean;
    type?: "string" | "number" | "boolean" | "array" | "object";
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
    pattern?: RegExp;
    enum?: string[];
    custom?: (value: any) => boolean | string;
}

interface ValidationSchema {
    body?: ValidationRule[];
    query?: ValidationRule[];
    params?: ValidationRule[];
}

export const validate = (schema: ValidationSchema) => {
    return (req: Request, _res: Response, next: NextFunction): void => {
        try {
            if (schema.body) {
                validateObject(req.body, schema.body, "body");
            }

            if (schema.query) {
                validateObject(req.query, schema.query, "query");
            }

            if (schema.params) {
                validateObject(req.params, schema.params, "params");
            }

            next();
        } catch (error) {
            next(error);
        }
    };
};

const validateObject = (
    obj: any,
    rules: ValidationRule[],
    context: string
): void => {
    if (!obj || typeof obj !== "object") {
        throw new ValidationError(
            `${context} is required and must be an object`
        );
    }

    for (const rule of rules) {
        const value = obj[rule.field];
        const fieldName = `${context}.${rule.field}`;

        if (
            rule.required &&
            (value === undefined || value === null || value === "")
        ) {
            throw new ValidationError(`${fieldName} is required`);
        }

        if (value === undefined || value === null) {
            continue;
        }

        if (rule.type) {
            if (!validateType(value, rule.type)) {
                throw new ValidationError(
                    `${fieldName} must be of type ${rule.type}`
                );
            }
        }

        if (typeof value === "string") {
            if (rule.minLength && value.length < rule.minLength) {
                throw new ValidationError(
                    `${fieldName} must be at least ${rule.minLength} characters long`
                );
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                throw new ValidationError(
                    `${fieldName} must be no more than ${rule.maxLength} characters long`
                );
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                throw new ValidationError(`${fieldName} format is invalid`);
            }
        }

        if (typeof value === "number") {
            if (rule.min !== undefined && value < rule.min) {
                throw new ValidationError(
                    `${fieldName} must be at least ${rule.min}`
                );
            }

            if (rule.max !== undefined && value > rule.max) {
                throw new ValidationError(
                    `${fieldName} must be no more than ${rule.max}`
                );
            }
        }

        if (rule.enum && !rule.enum.includes(value)) {
            throw new ValidationError(
                `${fieldName} must be one of: ${rule.enum.join(", ")}`
            );
        }

        if (rule.custom) {
            const customResult = rule.custom(value);
            if (customResult !== true) {
                throw new ValidationError(
                    customResult && typeof customResult === "string"
                        ? customResult
                        : `${fieldName} is invalid`
                );
            }
        }
    }
};

const validateType = (value: any, type: string): boolean => {
    switch (type) {
        case "string":
            return typeof value === "string";
        case "number":
            return typeof value === "number" && !isNaN(value);
        case "boolean":
            return typeof value === "boolean";
        case "array":
            return Array.isArray(value);
        case "object":
            return (
                typeof value === "object" &&
                !Array.isArray(value) &&
                value !== null
            );
        default:
            return true;
    }
};

export const commonSchemas = {
    pagination: {
        query: [
            {
                field: "page",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num > 0;
                },
            },
            {
                field: "limit",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return (
                        !isNaN(num) &&
                        num > 0 &&
                        num <= config.pagination.maxLimit
                    );
                },
            },
            {
                field: "sortBy",
                type: "string",
                maxLength: 50,
            },
            {
                field: "sortOrder",
                type: "string",
                enum: ["asc", "desc"],
            },
        ] as ValidationRule[],
    },

    problemFilters: {
        query: [
            {
                field: "difficulty",
                type: "string",
                enum: ["EASY", "MEDIUM", "HARD"],
            },
            {
                field: "tags",
                type: "array",
                custom: (value: any) => {
                    if (Array.isArray(value)) {
                        return value.every(
                            (tag) => typeof tag === "string" && tag.length > 0
                        );
                    }
                    return false;
                },
            },
            {
                field: "search",
                type: "string",
                minLength: 1,
                maxLength: 100,
            },
        ] as ValidationRule[],
    },

    idParam: {
        params: [
            {
                field: "id",
                type: "string",
                required: true,
                minLength: 1,
                maxLength: 50,
            },
        ] as ValidationRule[],
    },

    submission: {
        body: [
            {
                field: "problemId",
                type: "string",
                required: true,
                minLength: 1,
                maxLength: 50,
            },
            {
                field: "language",
                type: "string",
                required: true,
                enum: [
                    "JAVASCRIPT",
                    "PYTHON",
                    "JAVA",
                    "CPP",
                    "C",
                    "TYPESCRIPT",
                ],
            },
            {
                field: "code",
                type: "string",
                required: true,
                minLength: 1,
                maxLength: config.upload.maxCodeLength,
            },
        ] as ValidationRule[],
    },

    createProblem: {
        body: [
            {
                field: "title",
                type: "string",
                required: true,
                minLength: 1,
                maxLength: 200,
                pattern: /^[a-zA-Z0-9\s\-_.,!?()]+$/,
            },
            {
                field: "description",
                type: "string",
                required: true,
                minLength: 10,
                maxLength: 10000,
            },
            {
                field: "difficulty",
                type: "string",
                required: true,
                enum: ["EASY", "MEDIUM", "HARD"],
            },
            {
                field: "tags",
                type: "array",
                custom: (value: any) => {
                    if (!Array.isArray(value)) return false;
                    return value.every(
                        (tag) =>
                            typeof tag === "string" &&
                            tag.length >= 1 &&
                            tag.length <= 50 &&
                            /^[a-z0-9\-]+$/.test(tag)
                    );
                },
            },
            {
                field: "timeLimit",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num >= 500 && num <= 10000;
                },
            },
            {
                field: "memoryLimit",
                type: "string",
                custom: (value: any) => {
                    const num = parseInt(value);
                    return !isNaN(num) && num >= 64 && num <= 1024;
                },
            },
            {
                field: "testCases",
                type: "array",
                required: true,
                custom: (value: any) => {
                    if (!Array.isArray(value) || value.length === 0)
                        return false;
                    return value.every(
                        (tc) =>
                            typeof tc.input === "string" &&
                            typeof tc.output === "string" &&
                            tc.input.length <= config.upload.maxInputLength &&
                            tc.output.length <= config.upload.maxInputLength
                    );
                },
            },
        ] as ValidationRule[],
    },
};

export const sanitizeInput = (
    req: Request,
    _res: Response,
    next: NextFunction
): void => {
    if (req.body && typeof req.body === "object") {
        sanitizeObject(req.body);
    }

    if (req.query && typeof req.query === "object") {
        sanitizeObject(req.query);
    }

    if (req.params && typeof req.params === "object") {
        sanitizeObject(req.params);
    }

    next();
};

const sanitizeObject = (obj: any): void => {
    if (Array.isArray(obj)) {
        obj.forEach(sanitizeObject);
        return;
    }

    if (obj && typeof obj === "object") {
        for (const key in obj) {
            if (typeof obj[key] === "string") {
                obj[key] = obj[key].trim();

                if (
                    [
                        "title",
                        "description",
                        "username",
                        "firstName",
                        "lastName",
                    ].includes(key)
                ) {
                    obj[key] = obj[key].replace(/<[^>]*>/g, "");
                }
            } else if (typeof obj[key] === "object") {
                sanitizeObject(obj[key]);
            }
        }
    }
};
