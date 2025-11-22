import express, { Request, Response, NextFunction } from "express";
import bookRoutes from "./routes/book.routes";
import pino from "pino";
const logger = pino(
    {
        formatters: {
            level(label: string) {
                return {
                    level: label,
                };
            },
            bindings() {
                return {};
            },
        },
        timestamp: pino.stdTimeFunctions.isoTime,
    },
    pino.destination(1),
);

const app = express();

app.use(express.json());

function errorHandler(err: Error, req: Request, res: Response, next: NextFunction) {
    logger.error(err, "Error!");
    res.status(500).json({ message: "Internal server error" });
}

function loggingFn(req: Request, res: Response, next: NextFunction) {
    logger.info({ path: req.path, body: req.body }, "Received request");
    next();
}

app.use(loggingFn);

app.use("/", bookRoutes);

app.use(errorHandler);

app.listen(3001, () => {
    console.log("Bookstore app is running on port", 3001);
});
