import {DateTime} from "luxon";

export default class PaymentDetails {
    constructor(
        public id: number,
        public readonly userId: number,
        public readonly billingProvider: string,
        public readonly paymentMethod: string,
        public readonly secret: string,
        public readonly createdAt: DateTime = DateTime.utc()) { }
}