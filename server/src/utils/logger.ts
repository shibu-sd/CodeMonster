import { config } from "../config";
import { Request } from "express";

export enum LogLevel {
    ERROR = 0,
    WARN = 1,
    INFO = 2,
    DEBUG = 3,
}

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    meta?: {
        requestId?: string;
        userId?: string;
        method?: string;
        url?: string;
        ip?: string;
        userAgent?: string;
        duration?: number;
        error?: {
            name: string;
            message: string;
            stack?: string;
        };
        [key: string]: any;
    };
}

export class Logger {
    private static instance: Logger;
    private logLevel: LogLevel;
    private logBuffer: LogEntry[] = [];
    private maxBufferSize = 1000;

    private constructor() {
        this.logLevel = this.getLogLevelFromString(config.logging.level);
    }

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private getLogLevelFromString(level: string): LogLevel {
        switch (level.toLowerCase()) {
            case "error":
                return LogLevel.ERROR;
            case "warn":
                return LogLevel.WARN;
            case "info":
                return LogLevel.INFO;
            case "debug":
                return LogLevel.DEBUG;
            default:
                return LogLevel.INFO;
        }
    }

    private shouldLog(level: LogLevel): boolean {
        return level <= this.logLevel;
    }

    private formatLogEntry(entry: LogEntry): string {
        if (config.logging.format === "json") {
            return JSON.stringify(entry);
        }

        const levelName = LogLevel[entry.level];
        const timestamp = entry.timestamp;
        const message = entry.message;

        let formatted = `[${timestamp}] ${levelName}: ${message}`;

        if (entry.meta && Object.keys(entry.meta).length > 0) {
            formatted += ` ${JSON.stringify(entry.meta)}`;
        }

        return formatted;
    }

    private writeLog(entry: LogEntry): void {
        const formattedLog = this.formatLogEntry(entry);

        this.logBuffer.push(entry);
        if (this.logBuffer.length > this.maxBufferSize) {
            this.logBuffer.shift();
        }

        switch (entry.level) {
            case LogLevel.ERROR:
                console.error(formattedLog);
                break;
            case LogLevel.WARN:
                console.warn(formattedLog);
                break;
            case LogLevel.INFO:
                console.info(formattedLog);
                break;
            case LogLevel.DEBUG:
                console.debug(formattedLog);
                break;
        }
    }

    private createLogEntry(
        level: LogLevel,
        message: string,
        meta?: any
    ): LogEntry {
        return {
            timestamp: new Date().toISOString(),
            level,
            message,
            meta: meta && Object.keys(meta).length > 0 ? meta : undefined,
        };
    }

    public error(message: string, meta?: any): void {
        if (!this.shouldLog(LogLevel.ERROR)) return;

        const entry = this.createLogEntry(LogLevel.ERROR, message, meta);
        this.writeLog(entry);
    }

    public warn(message: string, meta?: any): void {
        if (!this.shouldLog(LogLevel.WARN)) return;

        const entry = this.createLogEntry(LogLevel.WARN, message, meta);
        this.writeLog(entry);
    }

    public info(message: string, meta?: any): void {
        if (!this.shouldLog(LogLevel.INFO)) return;

        const entry = this.createLogEntry(LogLevel.INFO, message, meta);
        this.writeLog(entry);
    }

    public debug(message: string, meta?: any): void {
        if (!this.shouldLog(LogLevel.DEBUG)) return;

        const entry = this.createLogEntry(LogLevel.DEBUG, message, meta);
        this.writeLog(entry);
    }

    public logRequest(req: Request, startTime?: number): void {
        const duration = startTime ? Date.now() - startTime : undefined;

        this.info("HTTP Request", {
            method: req.method,
            url: req.originalUrl,
            ip: req.ip,
            userAgent: req.get("User-Agent"),
            userId: (req as any).user?.id,
            duration,
        });
    }

    public logError(error: Error, context?: any): void {
        this.error(error.message, {
            error: {
                name: error.name,
                message: error.message,
                stack: error.stack,
            },
            ...context,
        });
    }

    public logPerformance(
        operation: string,
        duration: number,
        meta?: any
    ): void {
        this.info(`Performance: ${operation}`, {
            duration,
            operation,
            ...meta,
        });
    }

    public logSecurity(event: string, meta?: any): void {
        this.warn(`Security Event: ${event}`, {
            event,
            timestamp: new Date().toISOString(),
            ...meta,
        });
    }

    public logBusiness(event: string, meta?: any): void {
        this.info(`Business Event: ${event}`, {
            event,
            timestamp: new Date().toISOString(),
            ...meta,
        });
    }

    public getRecentLogs(count: number = 100): LogEntry[] {
        return this.logBuffer.slice(-count);
    }

    public clearLogs(): void {
        this.logBuffer = [];
    }

    public setLogLevel(level: LogLevel): void {
        this.logLevel = level;
    }

    public child(context: any): ChildLogger {
        return new ChildLogger(this, context);
    }
}

export class ChildLogger {
    constructor(private parent: Logger, private context: any) {}

    private mergeContext(meta?: any): any {
        return { ...this.context, ...meta };
    }

    public error(message: string, meta?: any): void {
        this.parent.error(message, this.mergeContext(meta));
    }

    public warn(message: string, meta?: any): void {
        this.parent.warn(message, this.mergeContext(meta));
    }

    public info(message: string, meta?: any): void {
        this.parent.info(message, this.mergeContext(meta));
    }

    public debug(message: string, meta?: any): void {
        this.parent.debug(message, this.mergeContext(meta));
    }

    public logError(error: Error, context?: any): void {
        this.parent.logError(error, this.mergeContext(context));
    }

    public logPerformance(
        operation: string,
        duration: number,
        meta?: any
    ): void {
        this.parent.logPerformance(
            operation,
            duration,
            this.mergeContext(meta)
        );
    }

    public logSecurity(event: string, meta?: any): void {
        this.parent.logSecurity(event, this.mergeContext(meta));
    }

    public logBusiness(event: string, meta?: any): void {
        this.parent.logBusiness(event, this.mergeContext(meta));
    }
}

export const logger = Logger.getInstance();

export const logError = (message: string, meta?: any) =>
    logger.error(message, meta);
export const logWarn = (message: string, meta?: any) =>
    logger.warn(message, meta);
export const logInfo = (message: string, meta?: any) =>
    logger.info(message, meta);
export const logDebug = (message: string, meta?: any) =>
    logger.debug(message, meta);

export const requestLogger = () => {
    return (req: Request, res: any, next: any) => {
        const startTime = Date.now();

        logger.logRequest(req);

        const originalEnd = res.end;
        res.end = function (...args: any[]) {
            const duration = Date.now() - startTime;

            logger.info("HTTP Response", {
                method: req.method,
                url: req.originalUrl,
                statusCode: res.statusCode,
                duration,
                userId: (req as any).user?.id,
            });

            originalEnd.apply(this, args);
        };

        next();
    };
};

export const logPerformance = (operationName?: string) => {
    return function (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor
    ) {
        const originalMethod = descriptor.value;

        descriptor.value = async function (...args: any[]) {
            const operation =
                operationName || `${target.constructor.name}.${propertyKey}`;
            const startTime = Date.now();

            try {
                const result = await originalMethod.apply(this, args);
                const duration = Date.now() - startTime;

                logger.logPerformance(operation, duration, {
                    success: true,
                });

                return result;
            } catch (error) {
                const duration = Date.now() - startTime;

                logger.logPerformance(operation, duration, {
                    success: false,
                    error: (error as Error).message,
                });

                throw error;
            }
        };

        return descriptor;
    };
};

export const logStructured = {
    userAction: (userId: string, action: string, details?: any) => {
        logger.logBusiness("User Action", {
            userId,
            action,
            ...details,
        });
    },

    systemEvent: (event: string, details?: any) => {
        logger.info(`System Event: ${event}`, {
            event,
            ...details,
        });
    },

    apiCall: (
        endpoint: string,
        method: string,
        statusCode: number,
        duration: number,
        userId?: string
    ) => {
        logger.info("API Call", {
            endpoint,
            method,
            statusCode,
            duration,
            userId,
        });
    },

    databaseOperation: (
        operation: string,
        table: string,
        duration: number,
        success: boolean
    ) => {
        logger.info("Database Operation", {
            operation,
            table,
            duration,
            success,
        });
    },

    queueOperation: (
        operation: string,
        queueName: string,
        jobId?: string,
        details?: any
    ) => {
        logger.info("Queue Operation", {
            operation,
            queueName,
            jobId,
            ...details,
        });
    },
};
