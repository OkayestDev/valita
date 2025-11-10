import { Request } from "../../../index";
import fs from "fs";
import path from "path";

export async function getBooksController(_: Request) {
    const books = JSON.parse(fs.readFileSync(path.join(__dirname, "books.json"), "utf8"));
    return {
        status: 200,
        body: {
            message: "Books fetched successfully",
            books,
        },
    };
}
