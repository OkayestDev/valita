export class ValidationError extends Error {
    constructor(
        message: string,
        public error: string,
    ) {
        super(message);
        this.error = error;
    }
}
