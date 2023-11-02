export default interface GenerateLinkParameters {
    userId: number,
    planId: string,
    paymentMethod: string,
    subscriptionId?: number,
    returnUrl: string
}