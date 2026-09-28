export class JsonBodyError extends Error {
    constructor(message = "Invalid JSON body") {
        super(message);
    }
}
