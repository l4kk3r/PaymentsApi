import Subscription from "../../models/Subscription";
import PaymentType from "../../models/enums/PaymentType";

export default interface IEmailService {
    notifyAboutSubscription(email: string, subscription: Subscription, paymentType: PaymentType): Promise<void>

    notifyAboutFailedRenew(email: string, subscription: Subscription): Promise<void>
}