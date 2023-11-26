import {Request} from "express";

export default interface ConfirmSubscriptionCancellationRequest extends Request {
    params: {
        key: string
    }
}