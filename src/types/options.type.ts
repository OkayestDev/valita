import { ErrorHandler } from "./error-handler.type";
import { LoggerFn } from "./logger-fn.type";
import { log } from "../utils/logger.utils";
import { logger } from "batch-stdout";
import { OptionsHandler } from "./controller.type";

export type Options<Log extends LoggerFn = typeof log.info> = {
    enableRequestLogging?: boolean;
    enableResponseLogging?: boolean;
    loggingFn?: Log;
    errorHandler?: ErrorHandler;
    batchStdoutOptions?: Parameters<typeof logger>[0];
    optionsHandler?: OptionsHandler;
};
