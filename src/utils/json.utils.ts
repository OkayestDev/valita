import { JsonBodyError } from "../errors/json-body.error";

export function parseJsonBody(data: string): Record<string, any> | undefined {
    if (!data) {
        return undefined;
    }
    try {
        return JSON.parse(data);
    } catch {
        throw new JsonBodyError();
    }
}
