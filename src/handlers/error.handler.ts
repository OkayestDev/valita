import { StatusCode } from "../constants/enums";
import { JsonBodyError } from "../errors/json-body.error";
import { MultipartError } from "../errors/multipart.error";
import { NoRouteError } from "../errors/no-route.error";
import { PayloadTooLargeError } from "../errors/payload-too-large.error";
import { ValidationError } from "../errors/validation.error";
import { ErrorHandler } from "../types/error-handler.type";
import { Options } from "../types/options.type";
import { Response } from "../types/response.type";

let errorHandlerFn: ErrorHandler | undefined = undefined;

export function configureErrorHandler(options: Options) {
    errorHandlerFn = options.errorHandler ?? undefined;
}

export const defaultErrorHandler: ErrorHandler = (err: any | Error): Response => {
    if (err instanceof ValidationError) {
        return {
            status: StatusCode.BadRequest,
            body: { message: err.message, error: err.error },
        };
    }

    if (err instanceof JsonBodyError || err instanceof MultipartError) {
        return {
            status: StatusCode.BadRequest,
            body: { message: err.message },
        };
    }

    if (err instanceof PayloadTooLargeError) {
        return {
            status: StatusCode.PayloadTooLarge,
            body: { message: err.message },
        };
    }

    if (err instanceof NoRouteError) {
        return {
            status: StatusCode.NotFound,
            body: { message: err.message },
        };
    }

    return {
        status: StatusCode.InternalServerError,
        body: { message: "Internal server error" },
    };
};

export function errorHandler(err: any | Error): Response {
    if (errorHandlerFn) {
        return errorHandlerFn(err);
    }

    return defaultErrorHandler(err);
}
