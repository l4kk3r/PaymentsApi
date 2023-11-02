import {Request} from "express";

export default interface GenerateLinkFromEmailRequest extends Request {
    body: {
        planId: string,
        paymentMethod: string,
        email: string,
        returnUrl: string
    }
}