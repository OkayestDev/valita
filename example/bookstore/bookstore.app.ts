require("./routes/book.routes");

import { Response } from "../../src/types/response.type";
import { createServer } from "../../index";

function errorHandler(err: Error): Response {
    console.log("Error!", err);
    return {
        status: 500,
        body: { message: "Internal server error" },
    };
}

function loggingFn(path: string, obj: Partial<Response | Request>) {
    console.log("Path:", path);
    console.log("Object:", {
        ...obj,
        headers: undefined,
    });
}
const server = createServer({
    errorHandler,
    enableRequestLogging: true,
    enableResponseLogging: true,
    loggingFn,
});

server.listen(3000, () => {
    console.log("Bookstore app is running on port 3000");
});
