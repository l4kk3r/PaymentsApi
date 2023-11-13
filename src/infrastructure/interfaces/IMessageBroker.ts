import PaymentMessage from "../../models/messages/PaymentMessage";
import FailedSubscriptionAutoRenewMessage from "../../models/messages/FailedSubscriptionAutoRenewMessage";
import BaseMessage from "../../models/messages/BaseMessage";

export default interface IMessageBroker {
    notify(message: BaseMessage): void

    getPaymentMessage(ack: boolean): Promise<PaymentMessage>

    getFailedAutoRenewMessage(ack: boolean): Promise<FailedSubscriptionAutoRenewMessage>

    purgeAll(): void
}