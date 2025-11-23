import { log, logger } from "../logger.utils";

describe("loggerUtils", () => {
    describe("log", () => {
        it("info", () => {
            const logSpy = jest.spyOn(logger, "info");
            log.info("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });

        it("error", () => {
            const logSpy = jest.spyOn(logger, "error");
            log.error("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });

        it("warn", () => {
            const logSpy = jest.spyOn(logger, "warning");
            log.warn("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });

        it("debug", () => {
            const logSpy = jest.spyOn(logger, "debug");
            log.debug("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith({ message: "test" }, "test");
        });
    });
});
