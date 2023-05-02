import Payment from "../../models/Payment";

export default interface IPaymentRepository {
    notify(service: string, payment: Payment): void
}