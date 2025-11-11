import { Response } from "./response.type";

export type ErrorHandler = (err: Error) => Response;
