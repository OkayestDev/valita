import { Response } from "../types/response.type";
import http from "http";

export function sendResponse(httpResponse: http.ServerResponse, response: Response) {
    const { status, headers, body } = response;
    if (typeof body === "object") {
        httpResponse.writeHead(status, {
            "Content-Type": "application/json",
            ...headers,
        });
        httpResponse.end(JSON.stringify(body));
        return;
    }

    httpResponse.writeHead(status, {
        "Content-Type": "text/plain",
        ...headers,
    });
    httpResponse.end(body ?? "{}");
}
