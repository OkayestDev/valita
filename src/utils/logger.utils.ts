import { logger as Logger } from "batch-stdout";
import { Options } from "../types/options.type";

export const defaultOptions = {
    inject: () => ({
        timestamp: new Date().toISOString(),
    }),
    isPrettyPrint: false,
};

export let logger = Logger(defaultOptions);

export function setLoggerOptions(options: Options) {
    if (options.batchStdoutOptions) {
        logger = Logger({
            ...defaultOptions,
            ...options.batchStdoutOptions,
        });
    }
}

export function flushLogger() {
    logger.flush();
}

export const log = {
    info: (...items: any[]) => logger.info(...items),
    error: (...items: any[]) => logger.error(...items),
    warn: (...items: any[]) => logger.warning(...items),
    debug: (...items: any[]) => logger.debug(...items),
};
