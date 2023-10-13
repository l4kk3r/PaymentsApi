export default interface IConfigService {
    getKeyByIdentifier(identifier: string): Promise<string>

    deactivate(id: number): Promise<void>
}