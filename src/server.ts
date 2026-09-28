import http from "http";
import { Method } from "./constants/enums";
import { sendHttpResponse } from "./utils/response.utils";
import { parseCookies, parseQuery } from "./utils/request.utils";
import { requestHandler } from "./handlers/request.handler";
import { Options } from "./types/options.type";
import { configureLogger } from "./handlers/logger.handler";
import { configureErrorHandler, errorHandler } from "./handlers/error.handler";
import { setLoggerOptions } from "./utils/logger.utils";
import { configureOptionsHandler } from "./handlers/options.handler";
import {
    contentTypeFromHeaders,
    DEFAULT_MAX_BODY_BYTES,
    parseIncomingBody,
    readRawBody,
} from "./utils/body.utils";

export const serverCallback = (options: Options = {}) => {
    configureErrorHandler(options);
    configureLogger(options);
    setLoggerOptions(options);
    configureOptionsHandler(options);
    const maxBodyBytes = options.maxBodyBytes ?? DEFAULT_MAX_BODY_BYTES;
    return async (req: http.IncomingMessage, httpResponse: http.ServerResponse) => {
        try {
            const [pathname, querystr] = req.url?.split("?") || [];
            const query = parseQuery(querystr);
            const raw = await readRawBody(req, maxBodyBytes);
            const { body, files } = parseIncomingBody(
                raw,
                contentTypeFromHeaders(req.headers),
                maxBodyBytes,
            );
            const cookies = parseCookies(req.headers.cookie as string);

            const method = (req.method || Method.Get) as Method;

            const response = await requestHandler({
                headers: req.headers as Record<string, string>,
                query: query as Record<string, string>,
                body,
                files,
                cookies: cookies,
                method,
                pathname,
            });

            return sendHttpResponse(httpResponse, response);
        } catch (err: any) {
            return sendHttpResponse(httpResponse, errorHandler(err));
        }
    };
};

export function createServer(options: Options = {}): http.Server {
    return http.createServer(serverCallback(options));
}
