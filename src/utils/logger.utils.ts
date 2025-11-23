import { logger as Logger } from "batch-stdout";
import { Options } from "../types/options.type";

const defaultOptions = {
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
    info: (message: string, obj: any) => logger.info(obj, message),
    error: (message: string, obj: any) => logger.error(obj, message),
    warn: (message: string, obj: any) => logger.warning(obj, message),
    debug: (message: string, obj: any) => logger.debug(obj, message),
};
