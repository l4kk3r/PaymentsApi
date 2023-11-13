import GenerateLinkParameters from "../parameters/GenerateLinkParameters";
import GenerateLinkFromEmailParameters from "../parameters/GenerateLinkFromEmailParameters";
import ConfirmPaymentParameters from "../parameters/ConfirmPaymentParameters";
import Subscription from "../../models/Subscription";

export default interface IPaymentService {
    generatePayment(parameters: GenerateLinkParameters): Promise<{ id: number, link: string }>

    generatePaymentFromEmail(parameters: GenerateLinkFromEmailParameters): Promise<string>

    confirmPayment(parameters: ConfirmPaymentParameters): Promise<void>

    autoRenewSubscription(subscription: Subscription): Promise<boolean>
}