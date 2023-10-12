export default interface IKeyService {
    getKeyByIdentifier(identifier: string): Promise<string>;
}