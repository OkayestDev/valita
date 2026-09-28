import { StatusCode } from "../constants/enums";

export type Response = {
    status: StatusCode;
    headers?: Record<string, any>;
    body?: Record<string, any>;
}