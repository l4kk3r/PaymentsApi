import Subscription from "../../models/Subscription";

export default interface ICrmService {
    writeSubscription(subscription: Subscription): Promise<void>

    updateSubscription(subscription: Subscription): Promise<void>
}