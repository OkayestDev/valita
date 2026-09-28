import fs from "fs";
import path from "path";
import { Request, StatusCode } from "../../../index";

type Book = {
    id: string;
    title: string;
    author: string;
    genre: string;
    published: number;
    in_stock: boolean;
};

const booksPath = path.join(__dirname, "books.json");
const newBooksPath = path.join(__dirname, "new-books.json");

function readBooks(filePath: string): Book[] {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

export function createBookController(req: Request) {
    const current = fs.existsSync(newBooksPath) ? readBooks(newBooksPath) : readBooks(booksPath);
    const nextId = current.reduce((max, book) => Math.max(max, Number(book.id) || 0), 0) + 1;
    const book: Book = {
        id: String(nextId),
        title: req.body.title,
        author: req.body.author,
        genre: req.body.genre,
        published: req.body.published,
        in_stock: req.body.in_stock,
    };
    const books = [...current, book];
    fs.writeFileSync(newBooksPath, `${JSON.stringify(books, null, 4)}\n`);

    return {
        status: StatusCode.Created,
        body: {
            message: "Book added successfully",
            book,
        },
    };
}
