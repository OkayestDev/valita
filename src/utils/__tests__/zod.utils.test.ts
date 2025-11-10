import { ValidationError } from "../../constants/validation-error";
import { Request } from "../../types/request.type";
import { validateRequest } from "../zod.utils";
import { z } from "zod";

describe("zodUtils", () => {
    describe("validateRequest", () => {
        it("should throw a ValidationError if the request is invalid", () => {
            const schema = {
                body: z.object({
                    name: z.string(),
                }),
            };
            const request = {
                body: {
                    name: 123,
                },
            };
            expect(() => validateRequest(schema, request as unknown as Request)).toThrow(
                ValidationError,
            );
        });

        it("should not throw on valid request", () => {
            const schema = {
                body: z.object({
                    name: z.string(),
                }),
            };
            const request = {
                body: {
                    name: "John Doe",
                },
            } as unknown as Request;
            expect(() => validateRequest(schema, request)).not.toThrow();
        });
    });
});
