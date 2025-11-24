import { defaultOptions, log, logger, setLoggerOptions } from "../logger.utils";
import * as batchStdout from "batch-stdout";

describe("loggerUtils", () => {
    describe("setLoggerOptions", () => {
        it("should set the logger options", () => {
            const loggerSpy = jest.spyOn(batchStdout, "logger");
            const options = {
                batchStdoutOptions: {
                    isPrettyPrint: true,
                },
            };
            setLoggerOptions(options);
            expect(loggerSpy).toHaveBeenCalledWith({
                ...defaultOptions,
                ...options.batchStdoutOptions,
            });
        });
    });

    describe("log", () => {
        it("info", () => {
            const logSpy = jest.spyOn(logger, "info");
            log.info("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith("test", { message: "test" });
        });

        it("error", () => {
            const logSpy = jest.spyOn(logger, "error");
            log.error("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith("test", { message: "test" });
        });

        it("warn", () => {
            const logSpy = jest.spyOn(logger, "warning");
            log.warn("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith("test", { message: "test" });
        });

        it("debug", () => {
            const logSpy = jest.spyOn(logger, "debug");
            log.debug("test", { message: "test" });
            expect(logSpy).toHaveBeenCalledWith("test", { message: "test" });
        });
    });
});
