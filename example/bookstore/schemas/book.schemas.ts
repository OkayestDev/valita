import { Schema } from "../../../index";
import { z } from "zod";

export const getBookSchema: Schema = {
    params: z.object({
        id: z.coerce.number().positive().int().min(0),
    }),
};
