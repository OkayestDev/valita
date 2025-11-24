import { ValidationError } from "../../constants/validation.error";
import { configureErrorHandler, errorHandler } from "../error.handler";

describe("errorHandler", () => {
    it("should return a 400 response if the error is a ValidationError", () => {
        const error = new ValidationError("Validation error", "Validation error");
        const response = errorHandler(error);
        expect(response.status).toBe(400);
    });

    it("should return a 500 response if the error is not a ValidationError", () => {
        const error = new Error("Internal server error");
        const response = errorHandler(error);
        expect(response.status).toBe(500);
    });

    it("should return a 500 response if the error is not a ValidationError and no error handler is provided", () => {
        const error = new Error("Internal server error");
        const response = errorHandler(error);
        expect(response.status).toBe(500);
    });

    it("should use error handler if provided", () => {
        const errorHandlerFn = jest
            .fn()
            .mockReturnValue({ status: 400, body: { message: "Validation error" } });
        configureErrorHandler({ errorHandler: errorHandlerFn });
        const error = new ValidationError("Validation error", "Validation error");
        const res = errorHandler(error);
        expect(res.status).toBe(400);
        expect(errorHandlerFn).toHaveBeenCalledWith(error);
    });
});
