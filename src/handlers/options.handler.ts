import { StatusCode } from "../constants/enums";
import { OptionsHandler } from "../types/controller.type";
import { Options } from "../types/options.type";
import { Request } from "../types/request.type";
import { Response } from "../types/response.type";

/**
 * Global options handler if no OPTIONS route provided and this is set in createServer, this will be invoked.
 */
let optionsHandlerFn: OptionsHandler | undefined = undefined;

export function configureOptionsHandler(options: Options) {
    optionsHandlerFn = options.optionsHandler ?? undefined;
}

export function optionsHandler(request: Request): Response | Promise<Response> {
    if (!optionsHandlerFn) {
        return {
            status: StatusCode.NotFound,
            body: { message: "No OPTIONS route provided and no options handler set" },
        };
    }
    return optionsHandlerFn(request);
}
