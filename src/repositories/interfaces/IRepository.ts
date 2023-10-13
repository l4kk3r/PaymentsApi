import Config from "../../models/Config";
import Subscription from "../../models/Subscription";

export default interface IRepository {
    getSubscriptionByIdentifier(identifier: string): Promise<Subscription>;

    getSubscriptionConfig(subscriptionId: number, serverIp: string): Promise<Config>;

    createConfig(config: Config): Promise<void>

    getConfig(id: number): Promise<Config>

    deactivateConfig(id: number): Promise<void>
}