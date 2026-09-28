import { get, post } from "../../../src/route";
import { createBookController } from "../controller/create-book.controller";
import { getBookController } from "../controller/get-book.controller";
import { getBooksController } from "../controller/get-books.controller";
import { uploadCoverController } from "../controller/upload-cover.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { createBookSchema, getBookSchema, uploadCoverSchema } from "../schemas/book.schemas";

get("/books", authMiddleware, getBooksController);
post("/books", authMiddleware, createBookSchema, createBookController);
get("/books/:id", authMiddleware, getBookSchema, getBookController);
post("/books/:id/cover", authMiddleware, uploadCoverSchema, uploadCoverController);
