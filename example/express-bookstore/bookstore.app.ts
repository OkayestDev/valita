import express, { Request, Response, NextFunction } from "express";
import bookRoutes from "./routes/book.routes";

const app = express();

// Middleware for JSON parsing
app.use(express.json());

// Error handler
function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    console.log("Error!", err);
    res.status(500).json({ message: "Internal server error" });
}

// Logging middleware
function loggingFn(req: Request, res: Response, next: NextFunction) {
    console.log("Path:", req.path);
    console.log("Object:", {
        method: req.method,
        query: req.query,
        params: req.params,
        body: req.body,
    });
    next();
}

app.use(loggingFn);

// Register routes
app.use("/", bookRoutes);

// Error handling middleware (must be last)
app.use(errorHandler);

app.listen(3001, () => {
    console.log("Bookstore app is running on port", 3001);
});
