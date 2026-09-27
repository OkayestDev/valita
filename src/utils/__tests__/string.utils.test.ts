import { splitStr } from "../string.utils";

describe("stringUtils", () => {
    describe(splitStr.name, () => {
        it("should split a string by a delimiter", () => {
            const result = splitStr("a/b/c", "/");
            expect(result).toEqual(["a", "b", "c"]);
        });

        it("should split a string by a delimiter", () => {
            const result = splitStr("user/:id/entities", "/");
            expect(result).toEqual(["user", ":id", "entities"]);
        });

        it("doesn't return empty string on last split", () => {
            const str = Array.from({ length: 5 }).fill("a/").join("");
            const result = splitStr(str, "/");
            expect(result).toEqual(["a", "a", "a", "a", "a"]);
            expect(str.split("/")).toEqual(["a", "a", "a", "a", "a", ""]);
        });
    });
});
