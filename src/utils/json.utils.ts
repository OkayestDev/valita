export function safeParseJson(data: string): Record<string, any> | undefined {
    if (!data) {
        return undefined;
    }
    try {
        return JSON.parse(data);
    } catch (error) {
        return undefined;
    }
}
