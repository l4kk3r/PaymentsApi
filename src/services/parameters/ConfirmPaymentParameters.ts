export default interface ConfirmPaymentParameters {
    uuid: string
    amount: number
    currency: string
    payload: string
    verification: string
}