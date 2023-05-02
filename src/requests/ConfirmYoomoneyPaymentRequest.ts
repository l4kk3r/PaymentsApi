import {Request} from "express";

export default interface ConfirmYoomoneyPaymentRequest extends Request {
    body: {
        operation_id: string,
        amount: number,
        currency: string,
        label: string,
        sha1_hash: string,
        datetime: string,
        sender: string,
        codepro: boolean,
        notification_type: string
    }
}