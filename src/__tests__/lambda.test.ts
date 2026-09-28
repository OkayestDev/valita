import { StatusCode } from "../constants/enums";
import * as route from "../route";
import { createLambda } from "../lambda";
import { ControllerFn } from "../types/controller.type";
import { Response } from "../types/response.type";
import { APIGatewayProxyEvent } from "aws-lambda";

describe("lambda", () => {
    describe("createLambda", () => {
        it("should create a lambda function", async () => {
            const controller = jest.fn((): Response => {
                return {
                    status: StatusCode.Ok,
                    headers: { "Content-Type": "application/json" },
                    body: { message: "big success!" },
                };
            }) as ControllerFn;
            route.post("/users/:id", controller);
            const lambda = createLambda({});
            expect(lambda).toBeDefined();
            const event = {
                path: "/users/123",
                httpMethod: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Cookie: "test=123",
                },
                body: JSON.stringify({ hello: "world" }),
            } as unknown as APIGatewayProxyEvent;
            const result = await lambda(event);
            expect(result).toEqual({
                statusCode: StatusCode.Ok,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "big success!" }),
            });
        });

        it("should use the configured options handler for OPTIONS requests", async () => {
            route.init();
            const optionsHandler = jest.fn((): Response => {
                return {
                    status: StatusCode.Ok,
                    headers: { "Access-Control-Allow-Origin": "*" },
                    body: { ok: true },
                };
            });
            const lambda = createLambda({ optionsHandler });
            const event = {
                path: "/users",
                httpMethod: "OPTIONS",
                headers: { origin: "https://example.com" },
                queryStringParameters: null,
                body: null,
            } as unknown as APIGatewayProxyEvent;

            const result = await lambda(event);

            expect(optionsHandler).toHaveBeenCalledWith({
                params: {},
                body: {},
                query: {},
                headers: { origin: "https://example.com" },
                cookies: {},
                files: {},
                method: "OPTIONS",
            });
            expect(result).toEqual({
                statusCode: StatusCode.Ok,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ ok: true }),
            });
        });

        it("should return a 400 response for a bad json body", async () => {
            route.init();
            const lambda = createLambda({});
            const result = await lambda({
                path: "/users",
                httpMethod: "POST",
                headers: { "Content-Type": "application/json" },
                body: "{",
            } as unknown as APIGatewayProxyEvent);

            expect(result).toEqual({
                statusCode: StatusCode.BadRequest,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Invalid JSON body" }),
            });
        });

        it("should parse a base64 multipart upload", async () => {
            route.init();
            const controller = jest.fn((): Response => ({ status: StatusCode.Created, body: { stored: true } }));
            route.post("/uploads", controller as ControllerFn);
            const boundary = "----valita";
            const raw = Buffer.concat([
                Buffer.from(
                    `--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="a.bin"\r\nContent-Type: application/octet-stream\r\n\r\n`,
                ),
                Buffer.from([0xff, 0xfe]),
                Buffer.from(`\r\n--${boundary}--\r\n`),
            ]);
            const lambda = createLambda({});
            const result = await lambda({
                path: "/uploads",
                httpMethod: "POST",
                headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
                body: raw.toString("base64"),
                isBase64Encoded: true,
            } as unknown as APIGatewayProxyEvent);

            expect(controller).toHaveBeenCalledWith(
                expect.objectContaining({
                    body: {},
                    files: {
                        file: {
                            filename: "a.bin",
                            mediaType: "application/octet-stream",
                            data: Buffer.from([0xff, 0xfe]),
                        },
                    },
                }),
            );
            expect(result).toEqual({
                statusCode: StatusCode.Created,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ stored: true }),
            });
        });
    });
});
