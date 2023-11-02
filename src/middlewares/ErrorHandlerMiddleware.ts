import e, {NextFunction, Request, Response} from "express";
import DomainError from "../errors/DomainError";

export default (error: Error, request: Request, response: Response, next: NextFunction) => {
    console.error(error.message)
    if (error instanceof DomainError) {
        response.status(400).json({ msg: error.message })
    } else {
        response.status(500).json({ msg: "Internal Server Error" })
    }
}