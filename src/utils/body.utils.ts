import http from "http";
import { MultipartError } from "../errors/multipart.error";
import { PayloadTooLargeError } from "../errors/payload-too-large.error";
import { UploadedFile } from "../types/uploaded-file.type";
import { parseJsonBody } from "./json.utils";

// 10MB
export const DEFAULT_MAX_BODY_BYTES = 10 * 1024 * 1024;

export type ParsedBody = {
    body: Record<string, any> | undefined;
    files: Record<string, UploadedFile | UploadedFile[]>;
};

export function contentTypeFromHeaders(
    headers: http.IncomingHttpHeaders | Record<string, string | undefined> | null | undefined,
): string | undefined {
    if (!headers) {
        return undefined;
    }
    for (const [key, value] of Object.entries(headers)) {
        if (key.toLowerCase() !== "content-type" || value === undefined) {
            continue;
        }
        return Array.isArray(value) ? value[0] : value;
    }
    return undefined;
}

export function readRawBody(
    req: http.IncomingMessage,
    maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
): Promise<Buffer | undefined> {
    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        let size = 0;
        let settled = false;

        const finish = (fn: () => void) => {
            if (settled) {
                return;
            }
            settled = true;
            fn();
        };

        req.on("data", (chunk: Buffer | string) => {
            const buf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
            size += buf.length;
            if (size > maxBodyBytes) {
                finish(() => reject(new PayloadTooLargeError()));
                req.destroy();
                return;
            }
            chunks.push(buf);
        });
        req.on("end", () => {
            finish(() => {
                if (size === 0) {
                    resolve(undefined);
                    return;
                }
                resolve(Buffer.concat(chunks, size));
            });
        });
        req.on("error", (err) => finish(() => reject(err)));
    });
}

export function parseIncomingBody(
    raw: Buffer | undefined,
    contentType: string | undefined,
    maxBodyBytes = DEFAULT_MAX_BODY_BYTES,
): ParsedBody {
    if (!raw || raw.length === 0) {
        return { body: undefined, files: {} };
    }
    if (raw.length > maxBodyBytes) {
        throw new PayloadTooLargeError();
    }
    if (isMultipart(contentType)) {
        return parseMultipart(raw, contentType);
    }
    return { body: parseJsonBody(raw.toString("utf8")), files: {} };
}

function isMultipart(contentType: string | undefined): contentType is string {
    if (!contentType) {
        return false;
    }
    return contentType.split(";")[0].trim().toLowerCase() === "multipart/form-data";
}

function boundaryOf(contentType: string): string {
    const match = /boundary=(?:"([^"]*)"|([^;]+))/i.exec(contentType);
    const boundary = match?.[1] ?? match?.[2]?.trim();
    if (!boundary) {
        throw new MultipartError("Missing multipart boundary");
    }
    return boundary;
}

function appendValue<T>(record: Record<string, T | T[]>, key: string, value: T) {
    const existing = record[key];
    if (existing === undefined) {
        record[key] = value;
        return;
    }
    if (Array.isArray(existing)) {
        existing.push(value);
        return;
    }
    record[key] = [existing, value];
}

function partHeader(headerText: string, name: string): string | undefined {
    const target = name.toLowerCase();
    for (const line of headerText.split("\r\n")) {
        const sep = line.indexOf(":");
        if (sep === -1) {
            continue;
        }
        if (line.slice(0, sep).trim().toLowerCase() === target) {
            return line.slice(sep + 1).trim();
        }
    }
    return undefined;
}

function dispositionParam(value: string, key: string): string | undefined {
    const quoted = new RegExp(`(?:^|;)\\s*${key}="([^"]*)"`, "i").exec(value);
    if (quoted) {
        return quoted[1];
    }
    const bare = new RegExp(`(?:^|;)\\s*${key}=([^;\\s]+)`, "i").exec(value);
    return bare?.[1];
}

/**
 * Single-level multipart/form-data. Parts are separated by CRLF, "--", and the boundary.
 */
export function parseMultipart(raw: Buffer, contentType: string): ParsedBody {
    const boundary = boundaryOf(contentType);
    const opening = Buffer.from(`--${boundary}`);
    const delimiter = Buffer.from(`\r\n--${boundary}`);
    const start = raw.indexOf(opening);
    if (start === -1) {
        throw new MultipartError();
    }

    const fields: Record<string, string | string[]> = {};
    const files: Record<string, UploadedFile | UploadedFile[]> = {};
    let cursor = start + opening.length;

    while (cursor < raw.length) {
        if (raw[cursor] === 45 && raw[cursor + 1] === 45) {
            break;
        }
        if (raw[cursor] === 13 && raw[cursor + 1] === 10) {
            cursor += 2;
        }

        const headerEnd = raw.indexOf("\r\n\r\n", cursor);
        if (headerEnd === -1) {
            throw new MultipartError();
        }
        const headerText = raw.subarray(cursor, headerEnd).toString("utf8");
        const disposition = partHeader(headerText, "content-disposition");
        if (!disposition) {
            throw new MultipartError("Missing content-disposition");
        }
        const name = dispositionParam(disposition, "name");
        if (name === undefined) {
            throw new MultipartError("Missing multipart field name");
        }

        const contentStart = headerEnd + 4;
        const next = raw.indexOf(delimiter, contentStart);
        if (next === -1) {
            throw new MultipartError();
        }
        const content = raw.subarray(contentStart, next);
        const filename = dispositionParam(disposition, "filename");
        if (filename !== undefined) {
            appendValue(files, name, {
                filename,
                mediaType: partHeader(headerText, "content-type") ?? "application/octet-stream",
                data: Buffer.from(content),
            });
        } else {
            appendValue(fields, name, content.toString("utf8"));
        }
        cursor = next + delimiter.length;
    }

    return { body: fields, files };
}
