import {Schema} from "joi";
import {NextFunction, Request, Response} from "express";
import DomainError from "../errors/DomainError";

export default (schema: Schema) =>
    (request: Request, response: Response, next: NextFunction) => {
    const result = schema.validate(request.body)
    if (!result.error) {
        next()
    } else {
        throw new DomainError("Incorrect body")
    }
}