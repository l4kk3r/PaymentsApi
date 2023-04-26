import {Request} from "express";

export default interface GenerateLinkRequest extends Request {
    body: {
        service: string,
        paymentMethod: string,
        currency: string,
        amount: number,
        payload: string
    }
}