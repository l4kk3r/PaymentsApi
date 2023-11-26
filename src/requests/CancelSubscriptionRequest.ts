import {Request} from "express";

export default interface CancelSubscriptionRequest extends Request {
    body: {
        email: string
    }
}