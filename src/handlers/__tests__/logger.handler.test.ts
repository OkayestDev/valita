import { configureLogger, logRequest, logResponse } from "../logger.handler";

describe("loggerHandler", () => {
    describe("logRequest", () => {
        it("should log a request", () => {
            const logSpy = jest.spyOn(console, "log");
            const request = {
                path: "test",
                headers: { "content-type": "application/json" },
                query: { var: "1" },
                body: { hello: "world" },
                cookies: { session: "123" },
                method: "GET",
            };
            configureLogger({ enableRequestLogging: true });
            logRequest("test", request);
            expect(logSpy).toHaveBeenCalledWith("test", request);
        });

        it("should not log a request if logging is disabled", () => {
            const request = {
                path: "test",
                headers: { "content-type": "application/json" },
                query: { var: "1" },
                body: { hello: "world" },
                cookies: { session: "123" },
                method: "GET",
            };
            const logSpy = jest.spyOn(console, "log");
            configureLogger({ enableRequestLogging: false });
            logRequest("test", request);
            expect(logSpy).not.toHaveBeenCalled();
        });
    });

    describe("logResponse", () => {
        it("should log a response", () => {
            const response = { status: 200, body: { message: "big success!" } };
            const logSpy = jest.spyOn(console, "log");
            configureLogger({ enableResponseLogging: true });
            logResponse("test", response);
            expect(logSpy).toHaveBeenCalledWith( "test", response);
        });

        it("should not log a response if logging is disabled", () => {
            const response = { status: 200, body: { message: "big success!" } };
            const logSpy = jest.spyOn(console, "log");
            configureLogger({ enableResponseLogging: false });
            logResponse("test", response);
            expect(logSpy).not.toHaveBeenCalled();
        });
    });
});
