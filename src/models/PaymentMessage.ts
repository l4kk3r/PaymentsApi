export default class PaymentMessage {
    amount: number
    currency: string
    payload: string

    constructor(
        amount: number,
        currency: string,
        payload: string
    ) {
        this.amount = amount
        this.currency = currency
        this.payload = payload
    }
}