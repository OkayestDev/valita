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
