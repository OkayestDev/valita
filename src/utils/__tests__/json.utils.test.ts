import { safeParseJson } from "../json.utils";

describe("jsonUtils", () => {
    describe("safeParseJson", () => {
        it("should parse json", () => {
            const json = '{"hello": "world"}';
            const result = safeParseJson(json);
            expect(result).toEqual({ hello: "world" });
        });

        it("should return undefined for an empty body without parsing", () => {
            expect(safeParseJson("")).toBeUndefined();
        });

        it("should return an undefined if the json is invalid", () => {
            const json = "invalid json";
            const result = safeParseJson(json);
            expect(result).toEqual(undefined);
        });
    });
});
