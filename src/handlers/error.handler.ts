import { NoRouteError } from "../constants/no-route-error";
import { ValidationError } from "../constants/validation-error";
import { ErrorHandler } from "../types/error-handler.type";
import { Options } from "../types/options.type";
import { Response } from "../types/response.type";

const errorHandlerConfig: { errorHandler: ErrorHandler | undefined } = {
    errorHandler: undefined,
};

export function configureErrorHandler(options: Options) {
    errorHandlerConfig.errorHandler = options.errorHandler;
}

export const defaultErrorHandler: ErrorHandler = (err: any | Error): Response => {
    if (err instanceof ValidationError) {
        return {
            status: 400,
            body: { message: err.message, error: err.error },
        };
    }

    if (err instanceof NoRouteError) {
        return {
            status: 404,
            body: { message: err.message },
        };
    }

    return {
        status: 500,
        body: { message: "Internal server error" },
    };
};

export function errorHandler(err: any | Error): Response {
    if (errorHandlerConfig.errorHandler) {
        return errorHandlerConfig.errorHandler(err);
    }

    return defaultErrorHandler(err);
}
