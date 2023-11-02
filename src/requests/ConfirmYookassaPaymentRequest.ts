import {Request} from "express";

export default interface ConfirmYookassaPaymentRequest extends Request {
    body: {
        type: string,
        event: string,
        object: {
            id: string,
            status: string
            amount: {
                currency: string,
                value: number
            },
            metadata: {
                paymentId: string
            },
            payment_method: {
                type: string,
                id: string,
                saved: boolean
            }
        }
    }
}