import PaymentType from "../enums/PaymentType";
import BaseMessage from "./BaseMessage";

export default class PaymentMessage extends BaseMessage {
    constructor(
        public readonly subscriptionId: number,
        public readonly type: PaymentType
    ) {
        super()
    }

    equals(other: PaymentMessage): boolean {
        return this.subscriptionId == other.subscriptionId && this.type == other.type;
    }
}