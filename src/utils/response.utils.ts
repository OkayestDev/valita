import { Response } from "../types/response.type";
import http from "http";

export function sendHttpResponse(httpResponse: http.ServerResponse, response: Response) {
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

export function sendLambdaResponse(response: Response) {
    if (typeof response.body === "object") {
        return {
            statusCode: response.status,
            headers: {
                "Content-Type": "application/json",
                ...response.headers,
            },
            body: JSON.stringify(response.body),
        };
    }

    return {
        statusCode: response.status,
        headers: {
            "Content-Type": "text/plain",
            ...response.headers,
        },
        body: response.body ?? "{}",
    };
}
