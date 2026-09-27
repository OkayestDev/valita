require("./routes/book.routes");

import { Response } from "../../src/types/response.type";
import { createServer, log } from "../../index";

function errorHandler(err: Error): Response {
    log.error("Error!", err);
    return {
        status: 500,
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
        status: 200,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "some-random-header": "some-random-value",
        },
    }),
});

server.listen(3000, () => {
    console.log("Bookstore app is running on port 3000");
});
