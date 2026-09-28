require("./routes/book.routes");

import { Response } from "../../src/types/response.type";
import { ValidationError, createServer, defaultErrorHandler, log, StatusCode } from "../../index";

function errorHandler(err: Error): Response {
    log.error("Error!", err);
    if (err instanceof ValidationError) {
        return defaultErrorHandler(err);
    }
    return {
        status: StatusCode.InternalServerError,
        body: { message: "Internal server error from example api" },
    };
}

function loggingFn(message: string, obj: Record<string, any>) {
    log.info(message, {
        ...obj,
        headers: undefined,
    });
}

const server = createServer({
    errorHandler,
    enableRequestLogging: true,
    enableResponseLogging: false,
    loggingFn,
    batchStdoutOptions: {
        inject: () => ({
            timestamp: new Date().toISOString(),
        }),
        isPrettyPrint: true,
    },
    optionsHandler: () => ({
        status: StatusCode.Ok,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "some-random-header": "some-random-value",
        },
    }),
});

const port = Number(process.env.PORT ?? 3000);

server.listen(port, () => {
    const address = server.address();
    const boundPort = typeof address === "object" && address ? address.port : port;
    console.log(`Bookstore app is running on port ${boundPort}`);
});
