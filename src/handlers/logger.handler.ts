import { LoggerFn } from "../types/logger-fn.type";
import { Options } from "../types/options.type";
import { Request } from "../types/request.type";
import { Response } from "../types/response.type";
import { log } from "../utils/logger.utils";

type LoggerConfig = {
    enableRequestLogging: boolean;
    enableResponseLogging: boolean;
    loggingFn: LoggerFn | undefined;
};

const loggerConfig: LoggerConfig = {
    enableRequestLogging: false,
    enableResponseLogging: false,
    loggingFn: undefined,
};

export function configureLogger(options: Options) {
    loggerConfig.enableRequestLogging = options.enableRequestLogging ?? false;
    loggerConfig.enableResponseLogging = options.enableResponseLogging ?? false;
    loggerConfig.loggingFn = options.loggingFn ?? undefined;
}

export function logRequest(path: string, request: Partial<Request>) {
    if (!loggerConfig.enableRequestLogging) {
        return;
    }

    if (loggerConfig.loggingFn) {
        return loggerConfig.loggingFn(`REQUEST: ${path}`, request);
    }

    log.info(`REQUEST: ${path}`, request);
}

export function logResponse(path: string, response: Response) {
    if (!loggerConfig.enableResponseLogging) {
        return;
    }

    if (loggerConfig.loggingFn) {
        return loggerConfig.loggingFn(`RESPONSE: ${path}`, response);
    }

    log.info(`RESPONSE: ${path}`, response);
}
