import PaymentMessage from "../../models/PaymentMessage";

export default interface IPaymentRepository {
    notify(service: string, payment: PaymentMessage): void
}