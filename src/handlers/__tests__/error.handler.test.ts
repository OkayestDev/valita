import { StatusCode } from "../../constants/enums";
import { JsonBodyError } from "../../errors/json-body.error";
import { MultipartError } from "../../errors/multipart.error";
import { PayloadTooLargeError } from "../../errors/payload-too-large.error";
import { ValidationError } from "../../errors/validation.error";
import { configureErrorHandler, errorHandler } from "../error.handler";

describe("errorHandler", () => {
    beforeEach(() => {
        configureErrorHandler({});
    });
    it("should return a 400 response if the error is a ValidationError", () => {
        const error = new ValidationError("Validation error", "Validation error");
        const response = errorHandler(error);
        expect(response.status).toBe(StatusCode.BadRequest);
    });

    it("should return a 400 response if the json body is invalid", () => {
        const response = errorHandler(new JsonBodyError());
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            body: { message: "Invalid JSON body" },
        });
    });

    it("should return a 400 response if the multipart body is invalid", () => {
        const response = errorHandler(new MultipartError());
        expect(response).toEqual({
            status: StatusCode.BadRequest,
            body: { message: "Invalid multipart body" },
        });
    });

    it("should return a 413 response if the body is too large", () => {
        const response = errorHandler(new PayloadTooLargeError());
        expect(response).toEqual({
            status: StatusCode.PayloadTooLarge,
            body: { message: "Request body too large" },
        });
    });

    it("should return a 500 response if the error is not a ValidationError", () => {
        const error = new Error("Internal server error");
        const response = errorHandler(error);
        expect(response.status).toBe(StatusCode.InternalServerError);
    });

    it("should return a 500 response if the error is not a ValidationError and no error handler is provided", () => {
        const error = new Error("Internal server error");
        const response = errorHandler(error);
        expect(response.status).toBe(StatusCode.InternalServerError);
    });

    it("should use error handler if provided", () => {
        const errorHandlerFn = jest
            .fn()
            .mockReturnValue({ status: StatusCode.BadRequest, body: { message: "Validation error" } });
        configureErrorHandler({ errorHandler: errorHandlerFn });
        const error = new ValidationError("Validation error", "Validation error");
        const res = errorHandler(error);
        expect(res.status).toBe(StatusCode.BadRequest);
        expect(errorHandlerFn).toHaveBeenCalledWith(error);
    });
});
