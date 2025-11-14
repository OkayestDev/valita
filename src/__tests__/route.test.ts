import { Method } from "../constants/enums";
import * as route from "../route";
import { z } from "zod";
import { Request } from "../types/request.type";
import { MiddlewareFn } from "../types/middleware.type";
import { ValidationError } from "../constants/validation-error";

describe("route", () => {
    beforeEach(() => {
        route.init();
    });

    describe("get", () => {
        it("should add a get route", () => {
            const controller = jest.fn();
            route.get("/get", controller);
            const { routeFns, params } = route.resolveController(Method.Get, "/get") || {};
            expect(routeFns?.[0]).toBe(controller);
            expect(params).toEqual({});
        });

        it("should throw an error if the route already exists", () => {
            const controller = jest.fn();
            route.get("/get", controller);
            expect(() => route.get("/get", controller)).toThrow("GET /get already exists");
        });
    });

    describe("post", () => {
        it("should add a post route", () => {
            const controller = jest.fn();
            route.post("/post", controller);
            const { routeFns, params } = route.resolveController(Method.Post, "/post") || {};
            expect(routeFns?.[0]).toBe(controller);
            expect(params).toEqual({});
        });
    });

    describe("put", () => {
        it("should add a put route", () => {
            const controller = jest.fn();
            route.put("/put", controller);
            const { routeFns, params } = route.resolveController(Method.Put, "/put") || {};
            expect(routeFns?.[0]).toBe(controller);
            expect(params).toEqual({});
        });
    });

    describe("delete", () => {
        it("should add a delete route", () => {
            const controller = jest.fn();
            route.del("/delete", controller);
            const { routeFns, params } = route.resolveController(Method.Delete, "/delete") || {};
            expect(routeFns?.[0]).toBe(controller);
            expect(params).toEqual({});
        });

        it("should throw an error if the route already exists", () => {
            const controller = jest.fn();
            route.del("/delete", controller);
            expect(() => route.del("/delete", controller)).toThrow(
                "DELETE /delete already exists",
            );
        });
    });

    describe("invokeRouteFns", () => {
        it("should invoke the controller function", async () => {
            const controller = jest.fn(() => ({ status: 200, body: { message: "success" } }));
            const middleware = jest.fn();
            const schema = {
                body: z.object({
                    name: z.string(),
                }),
            };
            const request: Request = {
                params: {},
                body: { name: "John Doe" },
                query: {},
                headers: {},
                cookies: {},
                method: Method.Post,
            };
            const res = await route.invokeRouteFns([middleware, schema, controller], request);
            expect(res).toEqual({ status: 200, body: { message: "success" } });
        });

        it("should short-circuit if a middleware function returns a response", async () => {
            const middleware = jest.fn(() => ({ status: 401, body: { message: "unauthorized" } }));
            const controller = jest.fn();
            const request: Request = {
                params: {},
                body: { name: "John Doe" },
                query: {},
                headers: {},
                cookies: {},
                method: Method.Post,
            };
            const res = await route.invokeRouteFns(
                [middleware as unknown as MiddlewareFn, controller],
                request,
            );
            expect(res).toEqual({ status: 401, body: { message: "unauthorized" } });
            expect(controller).not.toHaveBeenCalled();
            expect(middleware).toHaveBeenCalledWith(request);
        });

        it("should validate the request if schema is provided", async () => {
            const controller = jest.fn(() => ({ status: 200, body: { message: "success" } }));
            const middleware = jest.fn();
            const schema = {
                body: z.object({
                    name: z.string(),
                }),
            };
            const request: Request = {
                params: {},
                body: { name: 123 },
                query: {},
                headers: {},
                cookies: {},
                method: Method.Post,
            };
            expect(() =>
                route.invokeRouteFns([middleware, schema, controller], request),
            ).rejects.toThrow(ValidationError);
        });
    });
});
