import { log, pino } from "../logger.utils";

describe("loggerUtils", () => {
    describe("log", () => {
        it("info", () => {
            const logSpy = jest.spyOn(pino, "info");
            log.info("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });

        it("error", () => {
            const logSpy = jest.spyOn(pino, "error");
            log.error("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });

        it("warn", () => {
            const logSpy = jest.spyOn(pino, "warn");
            log.warn("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });

        it("debug", () => {
            const logSpy = jest.spyOn(pino, "debug");
            log.debug("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });

        it("trace", () => {
            const logSpy = jest.spyOn(pino, "trace");
            log.trace("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });

        it("fatal", () => {
            const logSpy = jest.spyOn(pino, "fatal");
            log.fatal("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });
    });
});
