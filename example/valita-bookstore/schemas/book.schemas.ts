import { Schema } from "../../../index";
import { z } from "zod";

export const getBookSchema: Schema = {
    params: z.object({
        id: z.coerce.number().positive().int(),
    }),
};

export const createBookSchema: Schema = {
    body: z.object({
        title: z.string().min(1),
        author: z.string().min(1),
        genre: z.string().min(1),
        published: z.number().int(),
        in_stock: z.boolean(),
    }),
};

export const uploadCoverSchema: Schema = {
    params: z.object({
        id: z.coerce.number().positive().int(),
    }),
    body: z.object({
        caption: z.string().optional(),
    }),
};
