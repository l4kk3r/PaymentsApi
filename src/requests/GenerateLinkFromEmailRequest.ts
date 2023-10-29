import {Request} from "express";

export default interface GenerateLinkFromEmailRequest extends Request {
    body: {
        service: string,
        paymentMethod: string,
        planId: string,
        email: string,
        returnUrl: string
    }
}