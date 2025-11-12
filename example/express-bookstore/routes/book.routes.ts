import { Router, Request, Response, NextFunction } from "express";
import { getBooksController } from "../controller/get-books.controller";
import { getBookController } from "../controller/get-book.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { getBookSchema } from "../schemas/book.schemas";

const router = Router();

// Validation middleware for params
function validateBookParams(req: Request, res: Response, next: NextFunction) {
    const result = getBookSchema.safeParse({ id: req.params.id });
    if (!result.success) {
        return res.status(400).json({ message: "Invalid book ID", error: result.error.message });
    }
    next();
}

router.get("/books", authMiddleware, getBooksController);
router.get("/books/:id", authMiddleware, validateBookParams, getBookController);

export default router;
