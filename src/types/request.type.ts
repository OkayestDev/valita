import { UploadedFile } from "./uploaded-file.type";

export type Request = {
    params: Record<string, any>;
    body: Record<string, any>;
    files: Record<string, UploadedFile | UploadedFile[]>;
    query: Record<string, any>;
    headers: Record<string, any>;
    cookies: Record<string, any>;
    method: string;
};
