export default class Config {
    constructor(
        public id: number,
        public readonly data: string,
        public readonly server: string,
        public readonly keyId: string,
        public readonly isActive: boolean,
        public readonly subscriptionId: number
    ) { }
}