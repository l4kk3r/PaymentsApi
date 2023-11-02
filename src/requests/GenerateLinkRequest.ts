import {Request} from "express";

export default interface GenerateLinkRequest extends Request {
    body: {
        userId: number,
        planId: string,
        paymentMethod: string,
        subscriptionId: number,
        returnUrl: string
    }
}