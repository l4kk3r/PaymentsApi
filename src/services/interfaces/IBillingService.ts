import GenerateLinkParameters from "../parameters/GenerateLinkParameters";
import ConfirmPaymentParameters from "../parameters/ConfirmPaymentParameters";

export default interface IBillingService {
    generateLink(amount: number, paymentId: number, returnUrl: string): Promise<string>

    verify(expectedAmount: number, realAmount: number, currency: string): boolean
}