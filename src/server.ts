import http from "http";
import { safeParseJson } from "./utils/json.utils";
import { Method } from "./constants/enums";
import querystring from "querystring";
import { sendHttpResponse } from "./utils/response.utils";
import { parseCookies } from "./utils/request.utils";
import { requestHandler } from "./handlers/request.handler";
import { Options } from "./types/options.type";
import { configureLogger } from "./handlers/logger.handler";
import { configureErrorHandler } from "./handlers/error.handler";

function parseBody(req: http.IncomingMessage): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];

        req.on("data", (chunk) => {
            chunks.push(chunk);
        });
        req.on("end", () => {
            try {
                const body = Buffer.concat(chunks).toString();
                resolve(safeParseJson(body));
            } catch (err) {
                reject(err);
            }
        });
        req.on("error", reject);
    });
}

export const serverCallback = (options: Options) => {
    configureErrorHandler(options);
    configureLogger(options);
    return async (req: http.IncomingMessage, httpResponse: http.ServerResponse) => {
        const [pathname, querystr] = req.url?.split("?") || [];
        const query = querystring.parse(querystr || "");
        const body = await parseBody(req);
        const cookies = parseCookies(req.headers.cookie as string);

        const method = (req.method || Method.Get) as Method;

        const response = await requestHandler({
            headers: req.headers as Record<string, string>,
            query: query as Record<string, string>,
            body,
            cookies: cookies,
            method,
            pathname,
        });

        return sendHttpResponse(httpResponse, response);
    };
};

export function createServer(options: Options = {}): http.Server {
    const server = http.createServer(serverCallback(options));
    return server;
}
