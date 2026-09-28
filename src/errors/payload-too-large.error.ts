export class PayloadTooLargeError extends Error {
    constructor(message = "Request body too large") {
        super(message);
    }
}
