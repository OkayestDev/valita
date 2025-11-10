export function safeParseJson(data: string): Record<string, any> {
    try {
        return JSON.parse(data);
    } catch (error) {
        return {};
    }
}
