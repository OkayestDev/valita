import { Method } from "../../constants/enums";
import { requestHandler } from "../request.handler";
import { Response } from "../../types/response.type";
import { ControllerFn } from "../../types/controller.type";
import * as route from "../../route";
import { configureErrorHandler } from "../error.handler";
import { configureLogger } from "../logger.handler";
import { log, logger } from "../../utils/logger.utils";
import * as loggerUtils from "../../utils/logger.utils";
import { stream } from "batch-stdout/dist/logger";

describe("requestHandler", () => {
    it("should return a 404 response if the route is not found", async () => {
        const response = await requestHandler({
            headers: {},
            query: {},
            body: {},
            cookies: {},
            method: Method.Get,
            pathname: "/not-found",
        });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Route GET /not-found not found" });
    });

    it("should return a 200 response if the route is found", async () => {
        const controller = jest.fn((): Response => {
            return {
                status: 200,
                headers: { "Content-Type": "application/json" },
                body: { message: "big success!" },
            };
        }) as ControllerFn;
        route.get("/users", controller);
        const response = await requestHandler({
            headers: {},
            query: {},
            body: {},
            cookies: {},
            method: Method.Get,
            pathname: "/users",
        });
        expect(response.status).toBe(200);
        expect(response.body).toEqual({ message: "big success!" });
    });

    it("should flush logs when the error handler returns a response", async () => {
        route.init();
        const flushSpy = jest.spyOn(loggerUtils, "flushLogger").mockImplementation(() => undefined);
        configureErrorHandler({
            errorHandler: () => ({
                status: 500,
                body: { message: "Internal server error from example api" },
            }),
        });
        route.get("/books", () => {
            throw new Error("boom");
        });

        const response = await requestHandler({
            headers: {},
            query: {},
            body: {},
            cookies: {},
            method: Method.Get,
            pathname: "/books",
        });

        expect(response).toEqual({
            status: 500,
            body: { message: "Internal server error from example api" },
        });
        expect(flushSpy).toHaveBeenCalled();
        configureErrorHandler({});
        flushSpy.mockRestore();
    });

    it("should flush every log written during a request", async () => {
        route.init();
        configureLogger({
            enableRequestLogging: true,
            enableResponseLogging: true,
        });
        configureErrorHandler({
            errorHandler: (err) => {
                log.error("handled error", { message: err.message });
                return { status: 500, body: { message: "failed" } };
            },
        });

        const writes: string[] = [];
        const writeSpy = jest.spyOn(stream, "write").mockImplementation((chunk: any) => {
            writes.push(Buffer.isBuffer(chunk) ? chunk.toString() : String(chunk));
            return true;
        });

        const readFlushedLogs = async (
            pathname: string,
            controller: ControllerFn,
        ): Promise<string> => {
            writes.length = 0;
            route.get(pathname, controller);
            await requestHandler({
                headers: {},
                query: {},
                body: {},
                cookies: {},
                method: Method.Get,
                pathname,
            });
            const flushed = writes.join("\n");
            writes.length = 0;
            logger.flush();
            return flushed;
        };

        try {
            const successLogs = await readFlushedLogs("/logged", () => {
                log.info("controller info");
                log.warn("controller warn");
                log.error("controller error");
                log.debug("controller debug");
                return { status: 200, body: { ok: true } };
            });
            const leftAfterSuccess = writes.join("\n");

            expect(successLogs).toContain("REQUEST: /logged");
            expect(successLogs).toContain("controller info");
            expect(successLogs).toContain("controller warn");
            expect(successLogs).toContain("controller error");
            expect(successLogs).toContain("controller debug");
            expect(successLogs).toContain("RESPONSE: /logged");
            expect(leftAfterSuccess).not.toContain("REQUEST: /logged");
            expect(leftAfterSuccess).not.toContain("controller info");
            expect(leftAfterSuccess).not.toContain("RESPONSE: /logged");

            const errorLogs = await readFlushedLogs("/explode", () => {
                log.warn("before throw");
                throw new Error("boom");
            });
            const leftAfterError = writes.join("\n");

            expect(errorLogs).toContain("REQUEST: /explode");
            expect(errorLogs).toContain("before throw");
            expect(errorLogs).toContain("handled error");
            expect(errorLogs).toContain("boom");
            expect(leftAfterError).not.toContain("REQUEST: /explode");
            expect(leftAfterError).not.toContain("before throw");
            expect(leftAfterError).not.toContain("handled error");
        } finally {
            configureLogger({});
            configureErrorHandler({});
            writeSpy.mockRestore();
        }
    });

    it("should handle unsupported methods", async () => {
        const response = await requestHandler({
            headers: {},
            query: {},
            body: {},
            cookies: {},
            method: "INVALID" as Method,
            pathname: "/users",
        });
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: "Method INVALID not supported" });
    });
});
