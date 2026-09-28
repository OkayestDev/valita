import { logger as Logger } from "batch-stdout";
import { Options } from "../types/options.type";

export const defaultOptions = {
    inject: () => ({
        timestamp: new Date().toISOString(),
    }),
    isPrettyPrint: false,
};

export let logger = Logger(defaultOptions);

let pendingLogs = false;

export function setLoggerOptions(options: Options) {
    if (options.batchStdoutOptions) {
        if (pendingLogs) {
            logger.flush();
            pendingLogs = false;
        }
        logger = Logger({
            ...defaultOptions,
            ...options.batchStdoutOptions,
        });
    }
}

export function flushLogger() {
    if (!pendingLogs) {
        return;
    }
    pendingLogs = false;
    logger.flush();
}

function record(write: () => void) {
    write();
    pendingLogs = true;
}

export const log = {
    info: (...items: any[]) => record(() => logger.info(...items)),
    error: (...items: any[]) => record(() => logger.error(...items)),
    warn: (...items: any[]) => record(() => logger.warning(...items)),
    debug: (...items: any[]) => record(() => logger.debug(...items)),
};
