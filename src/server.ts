import http from "http";
import { safeParseJson } from "./utils/json.utils";
import { Method } from "./constants/enums";
import querystring from "querystring";
import { sendResponse } from "./utils/response.utils";
import { parseCookies } from "./utils/request.utils";
import { requestHandler } from "./handlers/request.handler";
import { Options } from "./types/options.type";
import { configureLogger } from "./handlers/logger.handler";
import { configureErrorHandler } from "./handlers/error.handler";

function parseBody(req: http.IncomingMessage): Promise<Record<string, any>> {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", (chunk) => {
            data += chunk;
        });
        req.on("end", () => {
            resolve(safeParseJson(data));
        });
        req.on("error", (err) => reject(err));
    });
}

export const serverCallback = (options: Options) => {
    configureErrorHandler(options);
    configureLogger(options);
    return async (req: http.IncomingMessage, res: http.ServerResponse) => {
        const pathname = req.url?.split("?")[0] || "/";
        const query = querystring.parse(req.url?.split("?")[1] || "");
        const body = await parseBody(req);
        const cookies = parseCookies((req.headers.cookie || req.headers.Cookie || "") as string);

        const method = (req.method || Method.Get) as Method;

        const response = await requestHandler({
            headers: req.headers as Record<string, string>,
            query: query as Record<string, string>,
            body,
            cookies: cookies,
            method,
            pathname,
        });

        return sendResponse(res, response);
    };
};

export function createServer(options: Options = {}): http.Server {
    const server = http.createServer(serverCallback(options));
    return server;
}
