export default class DomainError extends Error {
    constructor(message) {
        super(message);

        Object.setPrototypeOf(this, DomainError.prototype);
    }
}