import { ErrorHandler } from "./error-handler.type";
import { LoggerFn } from "./logger-fn.type";

export type Options<Log extends LoggerFn = typeof console.log> = {
    enableRequestLogging?: boolean;
    enableResponseLogging?: boolean;
    loggingFn?: Log;
    errorHandler?: ErrorHandler;
};
