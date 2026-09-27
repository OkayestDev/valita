/**
 * Similar to .split() but returns empty string on last split which is useful for route matching.
 */
export function splitStr(str: string, delimiter: string = "/"): string[] {
    const out = [];
    let part = "";
    for (let i = 0; i < str.length; i++) {
        if (str[i] === delimiter) {
            out.push(part);
            part = "";
            continue;
        }
        part += str[i];
    }

    if (part) {
        out.push(part);
    }

    return out;
}
