import { Method, StatusCode } from "../../constants/enums";
import { Request } from "../../types/request.type";
import { Response } from "../../types/response.type";
import { configureOptionsHandler, optionsHandler } from "../options.handler";
import { requestHandler } from "../request.handler";

const request: Request = {
    params: {},
    body: {},
    query: {},
    headers: { origin: "https://example.com" },
    cookies: {},
    files: {},
    method: Method.Options,
};

describe("optionsHandler", () => {
    beforeEach(() => {
        configureOptionsHandler({});
    });

    afterEach(() => {
        configureOptionsHandler({});
    });

    it("should return a 404 response when no options handler is set", () => {
        const response = optionsHandler(request);
        expect(response).toEqual({
            status: StatusCode.NotFound,
            body: { message: "No OPTIONS route provided and no options handler set" },
        });
    });

    it("should invoke the configured options handler", () => {
        const handler = jest.fn(
            (): Response => ({
                status: StatusCode.NoContent,
                headers: { "Access-Control-Allow-Origin": "*" },
            }),
        );
        configureOptionsHandler({ optionsHandler: handler });

        const response = optionsHandler(request);

        expect(handler).toHaveBeenCalledWith(request);
        expect(response).toEqual({
            status: StatusCode.NoContent,
            headers: { "Access-Control-Allow-Origin": "*" },
        });
    });

    it("should support an async options handler", async () => {
        configureOptionsHandler({
            optionsHandler: async () => ({ status: StatusCode.Ok, body: { ok: true } }),
        });

        await expect(optionsHandler(request)).resolves.toEqual({
            status: StatusCode.Ok,
            body: { ok: true },
        });
    });

    it("should clear a previously configured handler", () => {
        configureOptionsHandler({
            optionsHandler: () => ({ status: StatusCode.NoContent }),
        });
        configureOptionsHandler({});

        const response = optionsHandler(request);
        expect(response).toEqual({
            status: StatusCode.NotFound,
            body: { message: "No OPTIONS route provided and no options handler set" },
        });
    });

    it("should handle an OPTIONS request when no route is registered", async () => {
        configureOptionsHandler({
            optionsHandler: () => ({
                status: StatusCode.Ok,
                headers: { "Access-Control-Allow-Methods": "GET, POST, OPTIONS" },
            }),
        });

        const response = await requestHandler({
            headers: {},
            query: {},
            body: {},
            cookies: {},
            method: Method.Options,
            pathname: "/users",
        });

        expect(response).toEqual({
            status: StatusCode.Ok,
            headers: { "Access-Control-Allow-Methods": "GET, POST, OPTIONS" },
        });
    });
});
