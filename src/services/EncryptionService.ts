import {injectable} from "inversify";
import IEncryptionService from "./interfaces/IEncryptionService";
import {createCipheriv, createDecipheriv, randomBytes} from "crypto";

@injectable()
export default class EncryptionService implements IEncryptionService {
    private readonly ENCRYPTION_ALGORITHM = 'aes-256-cbc'
    private readonly ENCRYPTION_IV = 16
    private readonly ENCRYPTION_KEY: Buffer

    constructor() {
        this.ENCRYPTION_KEY = Buffer.from(process.env.ENCRYPTION_KEY, 'latin1')
    }

    encrypt(text: string) {
        const iv = randomBytes(this.ENCRYPTION_IV);

        const cipher = createCipheriv(this.ENCRYPTION_ALGORITHM, this.ENCRYPTION_KEY, iv)
        let ciphered = cipher.update(text, 'utf-8', 'hex')
        ciphered += cipher.final('hex')

        return iv.toString('hex') + ':' + ciphered
    }

    decrypt(text: string) {
        const components = text.split(':')
        const iv = Buffer.from(components.shift(), 'hex')

        const decipher = createDecipheriv(this.ENCRYPTION_ALGORITHM, this.ENCRYPTION_KEY, iv)
        let deciphered = decipher.update(components.join(':'), 'hex', 'utf-8')
        deciphered += decipher.final('utf-8')

        return deciphered
    }
}