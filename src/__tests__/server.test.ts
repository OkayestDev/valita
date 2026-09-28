import { serverCallback } from "../server";
import * as route from "../route";
import { mockRequestResponse } from "./mock-request";
import { Method, StatusCode } from "../constants/enums";
import { Response } from "../types/response.type";
import { ControllerFn } from "../types/controller.type";
import { z } from "zod";

describe("server", () => {
    beforeEach(() => {
        route.init();
    });

    describe("serverCallback", () => {
        it("should handle incoming request", async () => {
            const controller = jest.fn((): Response => {
                return {
                    status: StatusCode.Ok,
                    headers: { "content-type": "application/json" },
                    body: { message: "big success!" },
                };
            }) as ControllerFn;
            route.post("/users/:id", controller);

            const { req, res } = mockRequestResponse({
                method: Method.Post,
                url: "/users/123?var=1",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ hello: "world" }),
            });
            await serverCallback({})(req, res);
            expect(controller).toHaveBeenCalledWith({
                params: { id: "123" },
                body: { hello: "world" },
                query: { var: "1" },
                headers: { "content-type": "application/json" },
                cookies: {},
                files: {},
                method: Method.Post,
            });
            expect(res.statusCode).toBe(StatusCode.Ok);
            expect(res.getHeader("content-type")).toBe("application/json");
            expect(res.end).toHaveBeenCalledWith(JSON.stringify({ message: "big success!" }));
        });

        it("should handle validation error", async () => {
            const controller = jest.fn((): Response => {
                return {
                    status: StatusCode.Ok,
                    headers: { "content-type": "application/json" },
                    body: { message: "big success!" },
                };
            }) as ControllerFn;
            const schema = {
                params: z.object({
                    id: z.number().positive().int().min(0),
                }),
                query: z.object({
                    var: z.string().nonempty(),
                }),
            };
            route.post("/books/:id", schema, controller);

            const { req, res } = mockRequestResponse({
                method: Method.Post,
                url: "/books/not-a-number?var=",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ hello: "world" }),
            });
            await serverCallback({})(req, res);
            expect(res.statusCode).toBe(StatusCode.BadRequest);
            expect(res.getHeader("content-type")).toBe("application/json");
            expect(res.end).toHaveBeenCalledWith(
                JSON.stringify({
                    message: "Validation failed",
                    error: [
                        {
                            expected: "number",
                            code: "invalid_type",
                            path: ["params", "id"],
                            message: "Invalid input: expected number, received string",
                        },
                        {
                            origin: "string",
                            code: "too_small",
                            minimum: 1,
                            inclusive: true,
                            path: ["query", "var"],
                            message: "Too small: expected string to have >=1 characters",
                        },
                    ],
                }),
            );
        });

        it("should handle get requests", async () => {
            const controller = jest.fn((): Response => {
                return {
                    status: StatusCode.Ok,
                    headers: { "content-type": "application/json" },
                    body: { message: "big success!" },
                };
            }) as ControllerFn;
            route.get("/users", controller);
            const { req, res } = mockRequestResponse({
                method: Method.Get,
                url: "/users",
                headers: { "content-type": "application/json" },
            });
            await serverCallback({})(req, res);
            expect(controller).toHaveBeenCalledWith({
                params: {},
                body: {},
                query: {},
                headers: { "content-type": "application/json" },
                cookies: {},
                files: {},
                method: Method.Get,
            });
            expect(res.statusCode).toBe(StatusCode.Ok);
            expect(res.getHeader("Content-Type")).toBe("application/json");
            expect(res.end).toHaveBeenCalledWith(JSON.stringify({ message: "big success!" }));
        });

        it("should use the configured options handler for OPTIONS requests", async () => {
            const optionsHandler = jest.fn((): Response => {
                return {
                    status: StatusCode.Ok,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: { ok: true },
                };
            });
            const { req, res } = mockRequestResponse({
                method: Method.Options,
                url: "/users",
                headers: { origin: "https://example.com" },
            });

            await serverCallback({ optionsHandler })(req, res);

            expect(optionsHandler).toHaveBeenCalledWith({
                params: {},
                body: {},
                query: {},
                headers: { origin: "https://example.com" },
                cookies: {},
                files: {},
                method: Method.Options,
            });
            expect(res.statusCode).toBe(StatusCode.Ok);
            expect(res.getHeader("Access-Control-Allow-Origin")).toBe("*");
            expect(res.end).toHaveBeenCalledWith(JSON.stringify({ ok: true }));
        });

        it("should return a 400 response for a bad json body", async () => {
            const controller = jest.fn((): Response => ({ status: StatusCode.Ok, body: { ok: true } }));
            route.post("/users", controller as ControllerFn);
            const { req, res } = mockRequestResponse({
                method: Method.Post,
                url: "/users",
                headers: { "content-type": "application/json" },
                body: "{",
            });

            await serverCallback({})(req, res);

            expect(controller).not.toHaveBeenCalled();
            expect(res.statusCode).toBe(StatusCode.BadRequest);
            expect(res.end).toHaveBeenCalledWith(
                JSON.stringify({ message: "Invalid JSON body" }),
            );
        });

        it("should parse a multipart upload", async () => {
            const controller = jest.fn((): Response => ({ status: StatusCode.Created, body: { ok: true } }));
            route.post("/uploads", controller as ControllerFn);
            const boundary = "----valita";
            const file = Buffer.from([0xff, 0x00, 0x61]);
            const { req, res } = mockRequestResponse({
                method: Method.Post,
                url: "/uploads",
                headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
                body: multipartBody(boundary, [
                    { name: "title", value: "Hello" },
                    { name: "file", filename: "a.txt", type: "text/plain", value: file },
                ]),
            });

            await serverCallback({})(req, res);

            expect(controller).toHaveBeenCalledWith({
                params: {},
                body: { title: "Hello" },
                query: {},
                headers: { "content-type": `multipart/form-data; boundary=${boundary}` },
                cookies: {},
                files: {
                    file: {
                        filename: "a.txt",
                        mediaType: "text/plain",
                        data: file,
                    },
                },
                method: Method.Post,
            });
            expect(res.statusCode).toBe(StatusCode.Created);
        });

        it("should return a 413 response when the body exceeds maxBodyBytes", async () => {
            const { req, res } = mockRequestResponse({
                method: Method.Post,
                url: "/users",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ hello: "world" }),
            });

            await serverCallback({ maxBodyBytes: 4 })(req, res);

            expect(res.statusCode).toBe(StatusCode.PayloadTooLarge);
            expect(res.end).toHaveBeenCalledWith(
                JSON.stringify({ message: "Request body too large" }),
            );
        });
    });
});

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
