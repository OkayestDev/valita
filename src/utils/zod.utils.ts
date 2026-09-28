import { Schema } from "../types/schema.type";
import { Request } from "../types/request.type";
import z from "zod";
import { ValidationError } from "../errors/validation.error";

const compiledSchemas = new WeakMap<Schema, z.ZodType>();

function getCompiledSchema(schema: Schema): z.ZodType {
    const existing = compiledSchemas.get(schema);
    if (existing) {
        return existing;
    }
    const compiled = z.object(schema);
    compiledSchemas.set(schema, compiled);
    return compiled;
}

export function compileSchema(schema: Schema): Schema {
    getCompiledSchema(schema);
    return schema;
}

export function validateRequest(schema: Schema, request: Request): void | never {
    const zodSchema = getCompiledSchema(schema);
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
