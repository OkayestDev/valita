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

const ERROR_TO_STATUS_CODE: Record<string, StatusCode> = {
    [ValidationError.name]: StatusCode.BadRequest,
    [JsonBodyError.name]: StatusCode.BadRequest,
    [MultipartError.name]: StatusCode.BadRequest,
    [PayloadTooLargeError.name]: StatusCode.PayloadTooLarge,
    [NoRouteError.name]: StatusCode.NotFound,
} as const;

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

    if (ERROR_TO_STATUS_CODE[err.constructor.name]) {
        return {
            status: ERROR_TO_STATUS_CODE[err.constructor.name],
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
