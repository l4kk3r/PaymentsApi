import BillingPaymentDetailsParameters from "./BillingPaymentDetailsParameters";

export default interface ConfirmPaymentParameters {
    uuid: string
    paymentId: number
    amount: number
    currency: string
    paymentDetails: BillingPaymentDetailsParameters
}