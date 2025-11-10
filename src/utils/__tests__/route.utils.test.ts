import * as routeUtils from "../route.utils";

describe("routeUtils", () => {
    describe("parseRoute", () => {
        it("should parse route correctly", () => {
            const route = "/user/:id/test";
            const url = "/user/123/test";
            const result = routeUtils.parseRoute(route, url);
            expect(result).toEqual({ id: "123" });
        });
    });

    describe("matchRoute", () => {
        it("should return true if route matches url", () => {
            const route = "/user/:id";
            const url = "/user/123";
            const result = routeUtils.matchRoute(route, url);
            expect(result).toBe(true);
        });

        it("should return false if route does not match url", () => {
            const route = "/comments/:id";
            const url = "/user/123";
            const result = routeUtils.matchRoute(route, url);
            expect(result).toBe(false);
        });

        it("should return false if no param provided", () => {
            const route = "/entities/:id";
            const url = "/entities";
            const result = routeUtils.matchRoute(route, url);
            expect(result).toBe(false);
        });
    });
});
