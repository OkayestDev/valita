require("./routes/book.routes");

import { createServer } from "../../index";

const server = createServer({
    errorHandler: console.error,
});

server.listen(3000, () => {
    console.log("Bookstore app is running on port 3000");
});
