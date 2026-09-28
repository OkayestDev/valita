import { Request, StatusCode } from "../../../index";

export function authMiddleware(req: Request) {
    if (!req.query.userId) {
        return {
            status: StatusCode.Unauthorized,
            body: { message: "Unauthorized" },
        };
    }
    return undefined;
}
