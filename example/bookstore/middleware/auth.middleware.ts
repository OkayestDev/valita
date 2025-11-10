import { Request } from "../../../index";

export function authMiddleware(req: Request) {
    if (!req.query.userId) {
        return {
            status: 401,
            body: { message: "Unauthorized" },
        };
    }
    return undefined;
}
