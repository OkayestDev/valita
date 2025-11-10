import { parseCookies } from "../request.utils";

describe("requestUtils", () => {
    describe("parseCookies", () => {
        it("should parse cookies from a cookie header", () => {
            const cookies = parseCookies("name=John Doe; age=30");
            expect(cookies).toEqual({ name: "John Doe", age: "30" });
        });
    });
});
