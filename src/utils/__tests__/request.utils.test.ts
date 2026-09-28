import { parseCookies, parseQuery } from "../request.utils";

describe("requestUtils", () => {
    describe("parseQuery", () => {
        it("should return an empty object when there is no query string", () => {
            expect(parseQuery(undefined)).toEqual({});
            expect(parseQuery("")).toEqual({});
        });

        it("should parse a query string", () => {
            expect(parseQuery("var=1")).toEqual({ var: "1" });
        });

        it("should collect repeated keys into an array", () => {
            expect(parseQuery("var=1&var=2")).toEqual({ var: ["1", "2"] });
        });
    });

    describe("parseCookies", () => {
        it("should parse cookies from a cookie header", () => {
            const cookies = parseCookies("name=John Doe; age=30");
            expect(cookies).toEqual({ name: "John Doe", age: "30" });
        });
    });
});
