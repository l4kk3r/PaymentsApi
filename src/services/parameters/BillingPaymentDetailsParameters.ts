export default interface BillingPaymentDetailsParameters {
    billingProvider: string,
    paymentMethod?: string,
    secret?: string,
    isSaved?: boolean
}