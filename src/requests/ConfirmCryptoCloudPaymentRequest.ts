import {Request} from "express";

export default interface ConfirmCryptoCloudPaymentRequest extends Request {
    body: {
        status: string,
        invoice_id: string,
        amount_crypto: number,
        currency: string,
        order_id: string,
        token: string
    }
}