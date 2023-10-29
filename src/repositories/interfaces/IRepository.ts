import Config from "../../models/Config";
import Subscription from "../../models/Subscription";
import User from "../../models/User";
import Payment from "../../models/Payment";

export default interface IRepository {
    getSubscriptionByIdentifier(identifier: string): Promise<Subscription>;

    getSubscriptionConfig(subscriptionId: number, serverIp: string): Promise<Config>;

    createConfig(config: Config): Promise<void>

    getConfig(id: number): Promise<Config>

    deactivateConfig(id: number): Promise<void>

    createUser(user: User): Promise<void>

    createPayment(payment: Payment): Promise<void>

    getUserByEmail(email: string): Promise<User>
}