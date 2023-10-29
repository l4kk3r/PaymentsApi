export default interface GenerateLinkParameters {
    service: string
    paymentMethod: string
    amount: number
    currency: string
    payload: string,
    returnUrl?: string
}
