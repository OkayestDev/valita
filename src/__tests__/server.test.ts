import { serverCallback } from "../server";
import * as route from "../route";
import { mockRequestResponse } from "./mock-request";
import { Method } from "../constants/enums";
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
                    status: 200,
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
            await serverCallback({ errorHandler: console.error })(req, res);
            expect(controller).toHaveBeenCalledWith({
                params: { id: "123" },
                body: { hello: "world" },
                query: { var: "1" },
                headers: { "content-type": "application/json" },
                cookies: {},
                method: Method.Post,
            });
            expect(res.statusCode).toBe(200);
            expect(res.getHeader("content-type")).toBe("application/json");
            expect(res.end).toHaveBeenCalledWith(JSON.stringify({ message: "big success!" }));
        });

        it("should handle validation error", async () => {
            const controller = jest.fn((): Response => {
                return {
                    status: 200,
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
            expect(res.statusCode).toBe(400);
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
    });
});
