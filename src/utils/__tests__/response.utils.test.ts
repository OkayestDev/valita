import { Method } from "../../constants/enums";
import { sendResponse } from "../response.utils";
import { mockRequestResponse } from "../../__tests__/mock-request";

describe("responseUtils", () => {
    describe("sendResponse", () => {
        it("should send a response", () => {
            const { res } = mockRequestResponse({
                method: Method.Post,
                url: "/users/123?var=1",
                headers: { "content-type": "application/json" },
                body: JSON.stringify({ hello: "world" }),
            });
            sendResponse(res, {
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
            sendResponse(res, {
                status: 200,
            });
            expect(res.statusCode).toBe(200);
            expect(res.getHeader("content-type")).toBe("text/plain");
            expect(res.end).toHaveBeenCalledWith("{}");
        });
    });
});
