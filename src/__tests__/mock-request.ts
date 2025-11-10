import { Readable, Writable } from "stream";
import { IncomingMessage, ServerResponse } from "http";

interface MockOptions {
    method?: string;
    url?: string;
    body?: string | Buffer | null;
    headers?: Record<string, string>;
}

export function mockRequestResponse({
    method = "GET",
    url = "/",
    body = null,
    headers = {},
}: MockOptions = {}): { req: IncomingMessage; res: ServerResponse } {
    // ---- Mock Request ----
    const req = new Readable() as IncomingMessage;
    req.method = method;
    req.url = url;
    req.headers = headers;

    if (body) {
        req.push(body);
    }
    req.push(null); // End stream

    // ---- Mock Response ----
    const res = new Writable() as ServerResponse;
    const chunks: Buffer[] = [];
    res.statusCode = 200;
    (res as any).headers = {} as Record<string, string>;

    res.write = jest.fn((chunk: any) => {
        chunks.push(Buffer.from(chunk));
        return true;
    });

    // @ts-ignore
    res.setHeader = jest.fn((name: string, value: string | number | readonly string[]) => {
        (res as any).headers[name.toLowerCase()] = value;
    });

    res.getHeader = jest.fn((name: string) => {
        return (res as any).headers[name.toLowerCase()];
    });

    // @ts-ignore
    res.writeHead = jest.fn((statusCode: number, headers?: Record<string, string>) => {
        res.statusCode = statusCode;
        if (headers) {
            Object.entries(headers).forEach(([key, val]) => res.setHeader(key, val));
        }
        return res;
    });

    res.end = jest.fn((chunk?: any) => {
        if (chunk) res.write(chunk);
        res.emit("finish");
        return res;
    });

    // Helper to read response body in tests
    (res as any)._getBody = () => Buffer.concat(chunks).toString();

    return { req, res };
}
