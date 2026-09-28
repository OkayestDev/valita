export class MultipartError extends Error {
    constructor(message = "Invalid multipart body") {
        super(message);
    }
}
