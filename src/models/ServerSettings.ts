export default class ServerSettings {
    constructor(
        public readonly ip: string,
        public readonly port: string,
        public readonly key: string
    ) {
    }
}