export default interface IEncryptionService {
    encrypt(text: string): string

    decrypt(text: string): string
}