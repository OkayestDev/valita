import { JsonBodyError } from "../../errors/json-body.error";
import { parseJsonBody } from "../json.utils";

describe("jsonUtils", () => {
    describe("parseJsonBody", () => {
        it("should parse json", () => {
            const json = '{"hello": "world"}';
            const result = parseJsonBody(json);
            expect(result).toEqual({ hello: "world" });
        });

        it("should return undefined for an empty body without parsing", () => {
            expect(parseJsonBody("")).toBeUndefined();
        });

        it("should throw if the json is invalid", () => {
            expect(() => parseJsonBody("invalid json")).toThrow(JsonBodyError);
        });
    });
});
