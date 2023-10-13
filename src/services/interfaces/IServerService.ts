export default interface IServerService {
    getRandomActiveServer(): string

    createKey(serverIp: string): Promise<{ip: string, keyId: string, accessUrl: string}>

    deactivateKey(serverIp: string, keyId: string): Promise<void>
}