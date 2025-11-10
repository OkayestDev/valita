export type Request = {
    params: Record<string, any>;
    body: Record<string, any>;
    query: Record<string, any>;
    headers: Record<string, any>;
    cookies: Record<string, any>;
    method: string;
};
