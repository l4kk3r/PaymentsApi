import {Request} from "express";

export default interface GeneratePaymentRequest extends Request {
    body: {
        userId: number,
        planId: string,
        paymentMethod: string,
        subscriptionId: number,
        returnUrl: string
    }
}