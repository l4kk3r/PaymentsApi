import Subscription from "../../models/Subscription";
import PlanV2 from "../../models/PlanV2";

export default interface ISubscriptionService {
    createSubscription(userId: number, plan: PlanV2): Promise<Subscription>

    renewSubscription(subscriptionId: number, plan: PlanV2): Promise<Subscription>

    requestSubscriptionCancellation(email: string): Promise<void>

    confirmSubscriptionCancellation(cancellationKey: string): Promise<void>
}