import pino from "pino";
const logger = pino(pino.destination(1));

export const log = {
    info: (message: string, obj: any) => logger.info(obj, message),
    error: (message: string, obj: any) => logger.error(obj, message),
    warn: (message: string, obj: any) => logger.warn(obj, message),
    debug: (message: string, obj: any) => logger.debug(obj, message),
    trace: (message: string, obj: any) => logger.trace(obj, message),
    fatal: (message: string, obj: any) => logger.fatal(obj, message),
};
