import { ErrorHandler } from "./error-handler.type";
import { LoggerFn } from "./logger-fn.type";
import { log } from "../utils/logger.utils";

export type Options<Log extends LoggerFn = typeof log.info> = {
    enableRequestLogging?: boolean;
    enableResponseLogging?: boolean;
    loggingFn?: Log;
    errorHandler?: ErrorHandler;
};
