import { Request } from "./request.type";
import { Response } from "./response.type";

type ReturnTypes = undefined | void | Response;

export type MiddlewareFn = (req: Request) => ReturnTypes | Promise<ReturnTypes>;
