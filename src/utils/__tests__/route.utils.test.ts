import * as routeUtils from "../route.utils";

describe("routeUtils", () => {
    describe(routeUtils.parseRoute.name, () => {
        it("should parse route correctly", () => {
            const route = "/user/:id/test";
            const url = "/user/123/test";
            const result = routeUtils.parseRoute(route, url);
            expect(result).toEqual({ id: "123" });
        });
    });

    describe(routeUtils.matchRoute.name, () => {
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

        it("should match wildcard route", () => {
            const route = "/entities/*";
            const url = "/entities/123";
            const result = routeUtils.matchRoute(route, url);
            expect(result).toBe(true);
        });
    });

    describe(routeUtils.resolvePathFromUrls.name, () => {
        it("should resolve path from urls", () => {
            const paths = ["/users/:id", "/entities/:id/test"];
            const url = "/users/123";
            const result = routeUtils.resolvePathFromUrls(paths, url);
            expect(result).toBe("/users/:id");
        });

        it("should return undefined if no path is found", () => {
            const paths = ["/users/:id"];
            const url = "/entities";
            const result = routeUtils.resolvePathFromUrls(paths, url);
            expect(result).toBeUndefined();
        });
    });
});
