import Config from "../../models/Config";
import Subscription from "../../models/Subscription";

export default interface IRepository {
    getSubscriptionByIdentifier(identifier: string): Promise<Subscription>;

    getSubscriptionConfigs(subscriptionId: number): Promise<Config[]>;
}