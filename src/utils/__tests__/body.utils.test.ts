import http from "http";
import { Readable } from "stream";
import { JsonBodyError } from "../../errors/json-body.error";
import { MultipartError } from "../../errors/multipart.error";
import { PayloadTooLargeError } from "../../errors/payload-too-large.error";
import { contentTypeFromHeaders, parseIncomingBody, parseMultipart, readRawBody } from "../body.utils";

function multipartBody(
    boundary: string,
    parts: { name: string; filename?: string; type?: string; value: string | Buffer }[],
) {
    const chunks: Buffer[] = [];
    for (const part of parts) {
        let header = `Content-Disposition: form-data; name="${part.name}"`;
        if (part.filename !== undefined) {
            header += `; filename="${part.filename}"`;
        }
        chunks.push(Buffer.from(`--${boundary}\r\n${header}\r\n`));
        if (part.type) {
            chunks.push(Buffer.from(`Content-Type: ${part.type}\r\n`));
        }
        chunks.push(Buffer.from("\r\n"));
        chunks.push(typeof part.value === "string" ? Buffer.from(part.value) : part.value);
        chunks.push(Buffer.from("\r\n"));
    }
    chunks.push(Buffer.from(`--${boundary}--\r\n`));
    return Buffer.concat(chunks);
}

function request() {
    return new Readable({
        read() {
            return undefined;
        },
    }) as http.IncomingMessage;
}

describe("bodyUtils", () => {
    describe("contentTypeFromHeaders", () => {
        it("should return undefined when headers are missing or have no content type", () => {
            expect(contentTypeFromHeaders(undefined)).toBeUndefined();
            expect(contentTypeFromHeaders(null)).toBeUndefined();
            expect(contentTypeFromHeaders({ accept: "application/json" })).toBeUndefined();
            expect(contentTypeFromHeaders({ "content-type": undefined })).toBeUndefined();
        });

        it("should read a content type header regardless of case", () => {
            expect(contentTypeFromHeaders({ "Content-Type": "application/json" })).toBe(
                "application/json",
            );
        });

        it("should use the first value when the header is repeated", () => {
            expect(
                contentTypeFromHeaders({
                    "content-type": ["text/plain", "application/json"],
                } as unknown as http.IncomingHttpHeaders),
            ).toBe("text/plain");
        });
    });

    describe("readRawBody", () => {
        it("should resolve undefined when the request has no body", async () => {
            const req = request();
            const pending = readRawBody(req);
            req.emit("end");
            await expect(pending).resolves.toBeUndefined();
        });

        it("should concatenate buffer and string chunks", async () => {
            const req = request();
            const pending = readRawBody(req);
            req.emit("data", Buffer.from("ab"));
            req.emit("data", "cd");
            req.emit("end");
            req.emit("error", new Error("late"));
            await expect(pending).resolves.toEqual(Buffer.from("abcd"));
        });

        it("should reject when the stream errors", async () => {
            const req = request();
            const pending = readRawBody(req);
            const err = new Error("socket");
            req.emit("error", err);
            req.emit("end");
            await expect(pending).rejects.toBe(err);
        });

        it("should reject once when the body exceeds the limit", async () => {
            const req = request();
            const pending = readRawBody(req, 2);
            req.emit("data", Buffer.from("abcd"));
            req.emit("end");
            req.emit("error", new Error("destroyed"));
            await expect(pending).rejects.toBeInstanceOf(PayloadTooLargeError);
        });
    });

    describe("parseIncomingBody", () => {
        it("should return an empty body when there is nothing to read", () => {
            expect(parseIncomingBody(undefined, "application/json")).toEqual({
                body: undefined,
                files: {},
            });
            expect(parseIncomingBody(Buffer.alloc(0), "")).toEqual({
                body: undefined,
                files: {},
            });
        });

        it("should parse a json body", () => {
            const raw = Buffer.from(JSON.stringify({ hello: "world" }));
            expect(parseIncomingBody(raw, "application/json; charset=utf-8")).toEqual({
                body: { hello: "world" },
                files: {},
            });
        });

        it("should throw when the json body is invalid", () => {
            expect(() => parseIncomingBody(Buffer.from("{"), undefined)).toThrow(JsonBodyError);
        });

        it("should throw when the body is larger than the limit", () => {
            expect(() => parseIncomingBody(Buffer.from("12345"), "application/json", 4)).toThrow(
                PayloadTooLargeError,
            );
        });

        it("should parse multipart bodies", () => {
            const raw = multipartBody("X", [{ name: "title", value: "Hello" }]);
            expect(parseIncomingBody(raw, "Multipart/Form-Data; boundary=X")).toEqual({
                body: { title: "Hello" },
                files: {},
            });
        });
    });

    describe("parseMultipart", () => {
        it("should read text fields and files", () => {
            const boundary = "----valita";
            const file = Buffer.from([0xff, 0x00]);
            const parsed = parseMultipart(
                multipartBody(boundary, [
                    { name: "title", value: "Hello" },
                    { name: "note", value: "one" },
                    { name: "note", value: "two" },
                    {
                        name: "file",
                        filename: "a.bin",
                        type: "application/octet-stream",
                        value: file,
                    },
                ]),
                `multipart/form-data; boundary="${boundary}"`,
            );

            expect(parsed.body).toEqual({ title: "Hello", note: ["one", "two"] });
            expect(parsed.files.file).toEqual({
                filename: "a.bin",
                mediaType: "application/octet-stream",
                data: file,
            });
        });

        it("should throw when the boundary is missing", () => {
            expect(() => parseMultipart(Buffer.from("nope"), "multipart/form-data")).toThrow(
                MultipartError,
            );
        });

        it("should throw when a part is truncated", () => {
            const raw = Buffer.from(
                '--X\r\nContent-Disposition: form-data; name="title"\r\n\r\nHello',
            );
            expect(() => parseMultipart(raw, "multipart/form-data; boundary=X")).toThrow(
                MultipartError,
            );
        });

        it("should collect a third repeated field onto the existing array", () => {
            const parsed = parseMultipart(
                multipartBody("X", [
                    { name: "note", value: "one" },
                    { name: "note", value: "two" },
                    { name: "note", value: "three" },
                ]),
                "multipart/form-data; boundary=X",
            );
            expect(parsed.body).toEqual({ note: ["one", "two", "three"] });
        });

        it("should default a file media type when the part has none", () => {
            const parsed = parseMultipart(
                multipartBody("X", [{ name: "file", filename: "a.bin", value: "hi" }]),
                "multipart/form-data; boundary=X ",
            );
            expect(parsed.files.file).toEqual({
                filename: "a.bin",
                mediaType: "application/octet-stream",
                data: Buffer.from("hi"),
            });
        });

        it("should read unquoted disposition parameters", () => {
            const raw = Buffer.from(
                '--X\r\nignored\r\nContent-Disposition: form-data; name=title; filename=a.txt\r\n\r\nhi\r\n--X--\r\n',
            );
            const parsed = parseMultipart(raw, "multipart/form-data; boundary=X");
            expect(parsed.files.title).toEqual({
                filename: "a.txt",
                mediaType: "application/octet-stream",
                data: Buffer.from("hi"),
            });
        });

        it("should throw when the body does not contain the boundary", () => {
            expect(() => parseMultipart(Buffer.from("hello"), "multipart/form-data; boundary=X")).toThrow(
                "Invalid multipart body",
            );
        });

        it("should throw when the boundary is empty", () => {
            expect(() => parseMultipart(Buffer.from("--"), 'multipart/form-data; boundary=""')).toThrow(
                "Missing multipart boundary",
            );
        });

        it("should throw when part headers never end", () => {
            const raw = Buffer.from('--X\r\nContent-Disposition: form-data; name="title"');
            expect(() => parseMultipart(raw, "multipart/form-data; boundary=X")).toThrow(
                "Invalid multipart body",
            );
        });

        it("should throw when a part has no content disposition", () => {
            const raw = Buffer.from("--X\r\nContent-Type: text/plain\r\n\r\nHello\r\n--X--\r\n");
            expect(() => parseMultipart(raw, "multipart/form-data; boundary=X")).toThrow(
                "Missing content-disposition",
            );
        });

        it("should throw when a part has no field name", () => {
            const raw = Buffer.from("--X\r\nContent-Disposition: form-data\r\n\r\nHello\r\n--X--\r\n");
            expect(() => parseMultipart(raw, "multipart/form-data; boundary=X")).toThrow(
                "Missing multipart field name",
            );
        });
    });
});
