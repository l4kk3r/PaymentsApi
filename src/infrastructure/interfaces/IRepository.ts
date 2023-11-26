import Config from "../../models/Config";
import Subscription from "../../models/Subscription";
import User from "../../models/User";
import Payment from "../../models/Payment";
import PaymentDetails from "../../models/PaymentDetails";
import PaymentStatus from "../../models/enums/PaymentStatus";
import PaymentType from "../../models/enums/PaymentType";
import AutoRenewStatus from "../../models/enums/AutoRenewStatus";

export default interface IRepository {
    getSubscriptionByIdentifier(identifier: string): Promise<Subscription>

    getSubscriptionConfig(subscriptionId: number, serverIp: string): Promise<Config>

    getSubscriptionById(id: number): Promise<Subscription>

    getExpiredSubscriptions(allowedStatuses: string[]): Promise<Subscription[]>

    getOldestActiveSubscriptionWithAutoRenewByUserId(userId: number): Promise<Subscription>

    setSubscriptionAutoRenewStatus(id: number, status: AutoRenewStatus): Promise<void>

    countActiveSubscriptionsWithAutoRenewByUserId(userId: number): Promise<number>

    createConfig(config: Config): Promise<void>

    getConfig(id: number): Promise<Config>

    deactivateConfig(id: number): Promise<void>

    createUser(user: User): Promise<void>

    createPayment(payment: Payment): Promise<void>

    getUserByEmail(email: string): Promise<User>

    getUserById(id: number): Promise<User>

    getPaymentById(id: number): Promise<Payment>

    updateSubscription(subscription: Subscription): Promise<void>

    createSubscription(subscription: Subscription): Promise<void>

    updatePayment(payment: Payment): Promise<void>

    updatePaymentAndSubscription(payment: Payment, subscription: Subscription, paymentDetailsModel?: PaymentDetails): Promise<void>

    getLastPaymentForSubscription(subscriptionId: number, paymentStatus: PaymentStatus, paymentType: PaymentType): Promise<Payment>

    createPaymentDetails(paymentDetails: PaymentDetails): Promise<void>

    getPaymentDetailsByUserId(userId: number): Promise<PaymentDetails>
}