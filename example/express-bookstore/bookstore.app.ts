import express, { Request, Response, NextFunction } from "express";
import bookRoutes from "./routes/book.routes";

const app = express();

app.use(express.json());

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log("Error!", err);
    res.status(500).json({ message: "Internal server error" });
}

function loggingFn(req: Request, res: Response, next: NextFunction) {
    console.log(`Path: ${req.path}`, req.body);
    next();
}

app.use(loggingFn);

app.use("/", bookRoutes);

app.use(errorHandler);

app.listen(3001, () => {
    console.log("Bookstore app is running on port", 3001);
});
