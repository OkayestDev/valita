export function parseRoute(route: string, pathname: string) {
    const routeParts = route.split("/").filter(Boolean);
    const urlParts = pathname.split("/").filter(Boolean);

    const params: Record<string, string> = {};
    let matched = true;

    for (let i = 0; i < routeParts.length; i++) {
        const routePart = routeParts[i];
        const urlPart = urlParts[i];

        if (routePart?.startsWith(":")) {
            const key = routePart.slice(1);
            params[key] = urlPart || "";
        } else if (routePart !== urlPart) {
            matched = false;
            break;
        }
    }

    // If route size doesn't match and last route part isn't a param, mark unmatched:
    if (matched && urlParts.length > routeParts.length) {
        matched = false;
    }

    return matched ? params : {};
}

export function resolvePathFromUrls(paths: string[], url: string): string | undefined {
    for (const path of paths) {
        if (matchRoute(path, url)) {
            return path;
        }
    }
    return undefined;
}

export function matchRoute(route: string, url: string): boolean {
    // Remove query string for the comparison
    const [pathname] = url.split("?");
    const routeParts = route.split("/").filter(Boolean);
    const urlParts = pathname.split("/").filter(Boolean);

    // Express-style matching: match exact segments except for ":" params, wildcards
    let i = 0,
        j = 0;

    while (i < routeParts.length && j < urlParts.length) {
        const routePart = routeParts[i];
        const urlPart = urlParts[j];

        if (routePart === "*") {
            // wildcard matches any remainder
            return true;
        } else if (routePart.startsWith(":")) {
            // Parameter matches any single segment
            i++;
            j++;
            continue;
        } else if (routePart === urlPart) {
            // Exact match
            i++;
            j++;
            continue;
        } else {
            // Mismatch
            return false;
        }
    }

    // Special handling for trailing wildcards in the route
    if (i < routeParts.length && routeParts[i] === "*" && i === routeParts.length - 1) {
        return true;
    }

    // Both must be fully matched for a valid route (no leftover segments)
    return i === routeParts.length && j === urlParts.length;
}
