import {DateTime} from "luxon";
import PaymentStatus from "./enums/PaymentStatus";
import PaymentType from "./enums/PaymentType";
import PlanV2 from "./PlanV2";

export default class Payment {
    constructor(
        public id: number,
        public readonly amount: number,
        public readonly userId: number,
        public readonly entityId: number,
        public readonly plan: PlanV2,
        public readonly type: PaymentType,
        public status: PaymentStatus = PaymentStatus.Created,
        public readonly createdAt: DateTime = DateTime.utc(),
        public paidAt?: DateTime
    ) { }
}