import { Method } from "./constants/enums";
import { ControllerFn } from "./types/controller.type";
import { MiddlewareFn } from "./types/middleware.type";
import { Schema } from "./types/schema.type";
import { resolvePathFromUrls } from "./utils/route.utils";
import { Request } from "./types/request.type";
import { Response } from "./types/response.type";
import { validateRequest } from "./utils/zod.utils";

type RouteFns = [...(MiddlewareFn | Schema)[], ControllerFn];

type RouteObj = Record<string, RouteFns>;

let gets: RouteObj = {};
let posts: RouteObj = {};
let puts: RouteObj = {};
let deletes: RouteObj = {};

export function init() {
    gets = {};
    posts = {};
    puts = {};
    deletes = {};
}

function method(method: Method, obj: RouteObj, path: string, fns: RouteFns) {
    if (obj[path]) {
        throw new Error(`Route ${method} ${path} already exists`);
    }

    obj[path] = fns;
}

export function get(path: string, ...routeFns: RouteFns) {
    return method(Method.Get, gets, path, routeFns);
}

export function post(path: string, ...routeFns: RouteFns) {
    return method(Method.Post, posts, path, routeFns);
}

export function put(path: string, ...routeFns: RouteFns) {
    return method(Method.Put, puts, path, routeFns);
}

export function del(path: string, ...routeFns: RouteFns) {
    return method(Method.Delete, deletes, path, routeFns);
}

export function resolveMethodObj(method: Method): RouteObj | never {
    switch (method) {
        case Method.Get:
            return gets;
        case Method.Post:
            return posts;
        case Method.Put:
            return puts;
        case Method.Delete:
            return deletes;
        default:
            throw new Error(`Method ${method} not supported`);
    }
}

export function resolvePathAndController(
    method: Method,
    url: string,
): { path: string; routeFns: RouteFns } | undefined {
    const methodObj = resolveMethodObj(method);
    const path = resolvePathFromUrls(Object.keys(methodObj), url);
    if (!path) {
        return undefined;
    }
    return { path, routeFns: methodObj[path] };
}

export async function invokeRouteFns(routeFns: RouteFns, request: Request): Promise<Response> {
    for (let i = 0; i < routeFns.length - 1; i++) {
        if (typeof routeFns[i] === "function") {
            const res = await (routeFns[i] as MiddlewareFn)(request);
            if (res) {
                return res as Response;
            }
            continue;
        }

        if (typeof routeFns[i] === "object") {
            validateRequest(routeFns[i] as Schema, request);
        }
    }

    return (routeFns[routeFns.length - 1] as ControllerFn)(request);
}
