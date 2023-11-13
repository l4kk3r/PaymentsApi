import {Request} from "express";

export default interface GeneratePaymentFromEmailRequest extends Request {
    body: {
        planId: string,
        paymentMethod: string,
        email: string,
        returnUrl: string
    }
}