import { Method } from "./constants/enums";
import { ControllerFn } from "./types/controller.type";
import { MiddlewareFn } from "./types/middleware.type";
import { Schema } from "./types/schema.type";
import { Request } from "./types/request.type";
import { Response } from "./types/response.type";
import { validateRequest } from "./utils/zod.utils";
import { NoRouteError } from "./constants/no-route-error";
import { createRouteTrie, RouteTrie } from "./trie";

type RouteFns = [...(MiddlewareFn | Schema)[], ControllerFn];

let gets = createRouteTrie<RouteFns>(Method.Get);
let posts = createRouteTrie<RouteFns>(Method.Post);
let puts = createRouteTrie<RouteFns>(Method.Put);
let deletes = createRouteTrie<RouteFns>(Method.Delete);

export function init() {
    gets = createRouteTrie<RouteFns>(Method.Get);
    posts = createRouteTrie<RouteFns>(Method.Post);
    puts = createRouteTrie<RouteFns>(Method.Put);
    deletes = createRouteTrie<RouteFns>(Method.Delete);
}

function method(trie: RouteTrie<RouteFns>, path: string, fns: RouteFns) {
    trie.insert(path, fns);
}

export function get(path: string, ...routeFns: RouteFns) {
    return method(gets, path, routeFns);
}

export function post(path: string, ...routeFns: RouteFns) {
    return method(posts, path, routeFns);
}

export function put(path: string, ...routeFns: RouteFns) {
    return method(puts, path, routeFns);
}

export function del(path: string, ...routeFns: RouteFns) {
    return method(deletes, path, routeFns);
}

export function resolveMethodObj(method: Method): RouteTrie<RouteFns> | never {
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
            throw new NoRouteError(`Method ${method} not supported`);
    }
}

export function resolveController(
    method: Method,
    url: string,
): { routeFns: RouteFns; params: Record<string, string> } | never {
    const trie = resolveMethodObj(method);
    const found = trie.find(url);
    if (!found) {
        throw new NoRouteError(`Route ${method} ${url} not found`);
    }
    return { params: found.params, routeFns: found.value };
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
