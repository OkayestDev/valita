import { Method } from "../../constants/enums";
import { requestHandler } from "../request.handler";
import { Response } from "../../types/response.type";
import { ControllerFn } from "../../types/controller.type";
import * as route from "../../route";

describe("requestHandler", () => {
    it("should return a 404 response if the route is not found", async () => {
        const response = await requestHandler({
            headers: {},
            query: {},
            body: {},
            cookies: {},
            method: Method.Get,
            pathname: "/not-found",
        });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Route GET /not-found not found" });
    });

    it("should return a 200 response if the route is found", async () => {
        const controller = jest.fn((): Response => {
            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: { message: "big success!" },
            };
        }) as ControllerFn;
        route.get("/users", controller);
        const response = await requestHandler({
            headers: {},
            query: {},
            body: {},
            cookies: {},
            method: Method.Get,
            pathname: "/users",
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "big success!" });
    });

    it("should handle unsupported methods", async () => {
        const response = await requestHandler({
            headers: {},
            query: {},
            body: {},
            cookies: {},
            method: "INVALID" as Method,
            pathname: "/users",
        });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Method INVALID not supported" });
    });
});
