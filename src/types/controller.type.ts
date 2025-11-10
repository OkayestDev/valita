import { Request } from "./request.type";
import { Response } from "./response.type";

export type ControllerFn = (req: Request) => Response | Promise<Response>;
