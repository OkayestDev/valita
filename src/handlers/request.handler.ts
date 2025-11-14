import { Response } from "../types/response.type";
import { Request } from "../types/request.type";
import { invokeRouteFns, resolveController } from "../route";
import { Method } from "../constants/enums";
import { errorHandler } from "./error.handler";
import { logRequest, logResponse } from "./logger.handler";

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
        logRequest(pathname, { headers, query, body, cookies, method });

        const { routeFns, params } = resolveController(method, pathname);

        const request: Request = {
            params,
            query,
            body,
            headers,
            cookies,
            method,
        };

        const response = await invokeRouteFns(routeFns, request);
        logResponse(pathname, response);
        return response;
    } catch (err: any) {
        return errorHandler(err);
    }
}
