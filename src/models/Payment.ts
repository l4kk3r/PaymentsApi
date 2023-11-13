import {DateTime} from "luxon";
import PaymentStatus from "./enums/PaymentStatus";
import PaymentType from "./enums/PaymentType";

export default class Payment {
    constructor(
        public id: number,
        public readonly amount: number,
        public readonly userId: number,
        public readonly entityId: number,
        public readonly planId: string,
        public readonly type: PaymentType,
        public status: PaymentStatus = PaymentStatus.Created,
        public readonly createdAt: DateTime = DateTime.utc(),
        public paidAt?: DateTime
    ) { }
}