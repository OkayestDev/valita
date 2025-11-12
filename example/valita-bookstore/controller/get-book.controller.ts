import fs from "fs";
import path from "path";
import { Request } from "../../../index";

export async function getBookController(req: Request) {
    const books = JSON.parse(fs.readFileSync(path.join(__dirname, "books.json"), "utf8"));
    return {
        status: 200,
        body: {
            message: "Book fetched successfully",
            book: books.find((book: any) => book.id === req.params.id),
        },
    };
}
