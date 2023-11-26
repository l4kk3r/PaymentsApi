import {Request} from "express";

export default interface GetKeyRequest extends Request {
    params: {
        identifier: string
    }
}