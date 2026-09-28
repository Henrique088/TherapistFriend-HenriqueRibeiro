// src/application/errors/AppError.ts

export default class AppError extends Error {
    public statusCode: number;
    public errors: string[];

    constructor(message: string | string[], statusCode = 400) {
        const messages = Array.isArray(message) ? message : [message];

        super(messages.join(', '));
        this.statusCode = statusCode;
        this.errors = messages;
        // O protótipo é necessário para que as subclasses de Error funcionem corretamente
        Object.setPrototypeOf(this, AppError.prototype); 
    }
}