import BaseMessage from "./BaseMessage";

export default class FailedSubscriptionAutoRenewMessage extends BaseMessage {
    public constructor(
        public readonly subscriptionId: number
    ) {
        super()
    }

    equals(other: FailedSubscriptionAutoRenewMessage): boolean {
        return this.subscriptionId === other.subscriptionId;
    }
}