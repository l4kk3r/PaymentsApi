import Subscription from "../../models/Subscription";
import Plan from "../../models/Plan";

export default interface ISubscriptionService {
    createSubscription(userId: number, plan: Plan): Promise<Subscription>

    renewSubscription(subscriptionId: number, plan: Plan): Promise<Subscription>
}