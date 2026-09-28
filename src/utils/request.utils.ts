export function parseQuery(querystr: string | undefined): Record<string, string | string[]> {
    if (!querystr) {
        return {};
    }

    const params = new URLSearchParams(querystr);
    const query: Record<string, string | string[]> = {};
    for (const [key, value] of params) {
        const existing = query[key];
        if (existing === undefined) {
            query[key] = value;
        } else if (typeof existing === "string") {
            query[key] = [existing, value];
        } else {
            existing.push(value);
        }
    }
    return query;
}

export function parseCookies(cookieHeader: string | undefined) {
    const cookies: Record<string, string> = {};
    if (!cookieHeader) {
        return cookies;
    }
    cookieHeader.split(";").forEach((cookie) => {
        const [name, ...rest] = cookie.trim().split("=");
        cookies[name] = decodeURIComponent(rest.join("="));
    });
    return cookies;
}
