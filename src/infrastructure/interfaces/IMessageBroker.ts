import PaymentMessage from "../../models/PaymentMessage";
import Payment from "../../models/Payment";

export default interface IMessageBroker {
    notify(payment: PaymentMessage): void

    getLatestMessage(noAck: boolean): Promise<PaymentMessage>
}