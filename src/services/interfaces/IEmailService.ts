import Subscription from "../../models/Subscription";
import PaymentType from "../../models/enums/PaymentType";

export default interface IEmailService {
    sendSubscription(email: string, subscription: Subscription, paymentType: PaymentType): Promise<void>

    sendFailedRenew(email: string, subscription: Subscription): Promise<void>

    sendSubscriptionCancellationRequest(email: string, cancellationLink: string): Promise<void>

    sendSubscriptionCancellationConfirmation(email: string, subscriptionsLeftCount: number): Promise<void>
}