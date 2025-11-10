import { Response } from "./types/response.type";
import { Request } from "./types/request.type";
import { ValidationError } from "./constants/validation-error";
import { invokeRouteFns, resolvePathAndController } from "./route";
import { Method } from "./constants/enums";
import { parseRoute } from "./utils/route.utils";

type RequestHandlerParams = {
    headers: Record<string, string>;
    query: Record<string, string>;
    body: Record<string, any>;
    cookies: Record<string, string>;
    method: Method;
    pathname: string;
};

export async function requestHandler({
    headers,
    query,
    body,
    cookies,
    method,
    pathname,
}: RequestHandlerParams): Promise<Response> {
    try {
        const { path, routeFns } = resolvePathAndController(method, pathname) || {};

        if (!path || !routeFns) {
            return {
                status: 404,
                body: {
                    message: "Route not found",
                },
            };
        }

        const params = parseRoute(path, pathname);

        const request: Request = {
            params,
            query,
            body,
            headers,
            cookies,
            method,
        };

        // Execute controller function and handle response
        return await invokeRouteFns(routeFns, request);
    } catch (err: any) {
        if (err instanceof ValidationError) {
            return {
                status: 400,
                body: { message: err.message, error: err.error },
            };
        }

        return {
            status: 500,
            body: { message: "Internal server error" },
        };
    }
}
