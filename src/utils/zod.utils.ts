import { Schema } from "../types/schema.type";
import { Request } from "../types/request.type";
import z from "zod";
import { ValidationError } from "../constants/validation-error";

export function validateRequest(schema: Schema, request: Request): void | never {
    const zodSchema = z.object(schema);
    const result = zodSchema.safeParse({
        params: request.params,
        body: request.body,
        query: request.query,
        headers: request.headers,
        cookies: request.cookies,
    });

    if (!result.success) {
        throw new ValidationError("Validation failed", JSON.parse(result.error.message));
    }
}
