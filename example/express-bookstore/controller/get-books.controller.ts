import { Request, Response } from "express";
import fs from "fs";
import path from "path";

export async function getBooksController(_req: Request, res: Response) {
    const books = JSON.parse(fs.readFileSync(path.join(__dirname, "books.json"), "utf8"));
    res.status(200).json({
        message: "Books fetched successfully",
        books,
    });
}
