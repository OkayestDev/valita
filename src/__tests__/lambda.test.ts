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
                    status: 200,
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
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "big success!" }),
            });
        });

        it("should use the configured options handler for OPTIONS requests", async () => {
            route.init();
            const optionsHandler = jest.fn((): Response => {
                return {
                    status: 200,
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
                method: "OPTIONS",
            });
            expect(result).toEqual({
                statusCode: 200,
                headers: {
                    "Content-Type": "application/json",
                    "Access-Control-Allow-Origin": "*",
                },
                body: JSON.stringify({ ok: true }),
            });
        });
    });
});
