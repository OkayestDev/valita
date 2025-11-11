import { Request } from "./request.type";
import { Response } from "./response.type";

export type LoggerFn = (path: string, obj: Partial<Response | Request>) => any;

