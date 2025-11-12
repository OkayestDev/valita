import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export async function getBookController(req: Request, res: Response) {
    const books = JSON.parse(fs.readFileSync(path.join(__dirname, "books.json"), "utf8"));
    const book = books.find((book: any) => book.id === req.params.id);
    res.status(200).json({
        message: "Book fetched successfully",
        book,
    });
}
