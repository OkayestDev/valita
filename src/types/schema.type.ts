import { ZodSchema } from "zod";

export type Schema = {
    body?: ZodSchema;
    query?: ZodSchema;
    params?: ZodSchema;
    headers?: ZodSchema;
    cookies?: ZodSchema;
};
