export default class PaymentMessage {
    constructor(
        public readonly subscriptionId: number,
        public readonly type: string
    ) {
    }
}