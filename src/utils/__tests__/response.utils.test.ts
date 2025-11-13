import { Method } from "../../constants/enums";
import { sendHttpResponse, sendLambdaResponse } from "../response.utils";
import { mockRequestResponse } from "../../__tests__/mock-request";

describe("responseUtils", () => {
    describe("sendHttpResponse", () => {
        it("should send a response", () => {
            const { res } = mockRequestResponse({
                method: Method.Post,
                url: "/users/123?var=1",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ hello: "world" }),
            });
            sendHttpResponse(res, {
                status: 200,
                body: { message: "big success!" },
            });
            expect(res.statusCode).toBe(200);
            expect(res.getHeader("content-type")).toBe("application/json");
            expect(res.end).toHaveBeenCalledWith(JSON.stringify({ message: "big success!" }));
        });

        it("should handle no body response", () => {
            const { res } = mockRequestResponse({
                method: Method.Post,
                url: "/users/123?var=1",
                headers: { "content-type": "application/json" },
            });
            sendHttpResponse(res, {
                status: 200,
            });
            expect(res.statusCode).toBe(200);
            expect(res.getHeader("content-type")).toBe("text/plain");
            expect(res.end).toHaveBeenCalledWith("{}");
        });
    });

    describe("sendLambdaResponse", () => {
        it("should send a response", () => {
            const response = { status: 200, body: { message: "big success!" } };
            const result = sendLambdaResponse(response);
            expect(result).toEqual({
                statusCode: 200,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "big success!" }),
            });
        });

        it("should handle no body response", () => {
            const response = { status: 200 };
            const result = sendLambdaResponse(response);
            expect(result).toEqual({
                statusCode: 200,
                headers: { "Content-Type": "text/plain" },
                body: "{}",
            });
        });
    });
});
