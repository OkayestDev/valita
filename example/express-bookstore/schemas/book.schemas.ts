import { z } from "zod";

export const getBookSchema = z.object({
    id: z.coerce.number().positive().int(),
});
