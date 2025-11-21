import { LoggerFn } from "../types/logger-fn.type";
import { Options } from "../types/options.type";
import { Request } from "../types/request.type";
import { Response } from "../types/response.type";
import { log } from "../utils/logger.utils";

const loggerConfig = {
    enableRequestLogging: false,
    enableResponseLogging: false,
    loggingFn: log.info as LoggerFn,
};

export function configureLogger(options: Options) {
    loggerConfig.enableRequestLogging = options.enableRequestLogging ?? false;
    loggerConfig.enableResponseLogging = options.enableResponseLogging ?? false;
    loggerConfig.loggingFn = options.loggingFn ?? log.info;
}

export function logRequest(path: string, request: Partial<Request>) {
    if (!loggerConfig.enableRequestLogging) {
        return;
    }
    loggerConfig.loggingFn(`REQUEST: ${path}`, request);
}

export function logResponse(path: string, response: Response) {
    if (!loggerConfig.enableResponseLogging) {
        return;
    }
    loggerConfig.loggingFn(`RESPONSE: ${path}`, response);
}
