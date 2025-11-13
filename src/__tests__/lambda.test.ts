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
    });
});
