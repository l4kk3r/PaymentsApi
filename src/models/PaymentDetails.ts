export default class PaymentDetails {
    constructor(
        public id: number,
        public readonly userId: number,
        public readonly billingProvider: string,
        public readonly paymentMethod: string,
        public readonly secret: string) { }
}