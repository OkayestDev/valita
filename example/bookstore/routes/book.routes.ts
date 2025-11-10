import { get } from "../../../src/route";
import { getBookController } from "../controller/get-book.controller";
import { getBooksController } from "../controller/get-books.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { getBookSchema } from "../schemas/book.schemas";

get("/books", authMiddleware, getBooksController);
get("/books/:id", authMiddleware, getBookSchema, getBookController);
