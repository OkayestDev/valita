require("./routes/book.routes");

import { Response } from "../../src/types/response.type";
import { createServer, log } from "../../index";

function errorHandler(err: Error): Response {
    log.error("Error!", err);
    return {
        status: 500,
        body: { message: "Internal server error" },
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
});

server.listen(3000, () => {
    console.log("Bookstore app is running on port 3000");
});
