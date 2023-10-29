import GenerateLinkParameters from "../parameters/GenerateLinkParameters";
import ConfirmPaymentParameters from "../parameters/ConfirmPaymentParameters";

export default interface IPaymentService {
    generateLink(parameters: GenerateLinkParameters): Promise<string>

    confirmPayment(parameters: ConfirmPaymentParameters): Promise<void>
}