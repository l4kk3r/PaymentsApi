import {inject, injectable} from "inversify";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import ConfirmPaymentParameters from "./parameters/ConfirmPaymentParameters";
import ICardService from "./interfaces/ICardService";
import IYooMoneyService from "./interfaces/IYooMoneyService";
import DomainError from "../errors/DomainError";
import Payment from "../models/Payment";
import {TYPES} from "../di/types";
import IPaymentRepository from "../repositories/interfaces/IPaymentRepository";
import {createHash} from "crypto";

@injectable()
export default class YoomoneyService implements IYooMoneyService, ICardService {
    private readonly baseUrl: string
    private readonly verificationTokens: string[]
    private readonly walletIds: {}

    @inject(TYPES.IPaymentRepository) private _paymentRepository: IPaymentRepository

    constructor() {
        const baseUrl = process.env.YOOMONEY_BASE_URL

        this.baseUrl = this.createFullBaseUrl(baseUrl)
        this.walletIds = JSON.parse(process.env.YOOMONEY_WALLET_IDS)
        this.verificationTokens = JSON.parse(process.env.YOOMONEY_VERIFICATION_TOKENS)
    }

    async generateLink(generateParameters: GenerateLinkParameters): Promise<string> {
        const {paymentMethod, amount, service, payload} = generateParameters
        const type = paymentMethod == 'card' ? 'AC' : 'PC'
        const fullPayload = `${service}:${payload}`

        return this.baseUrl
            .replace('%WALLET%', this.walletIds[service])
            .replace('%TYPE%', type)
            .replace('%SUM%', amount.toString())
            .replace('%PAYLOAD%', fullPayload)
    }

    async confirmPayment(parameters: ConfirmPaymentParameters): Promise<void> {
        const { uuid, amount, currency, payload, verification } = parameters

        const verified = this.verify(verification)
        if (!verified)
            throw new DomainError("Incorrect verification")

        const payloadData = payload.split(':')
        const service = payloadData.shift()
        const paymentPayload = payloadData.join(':')
        const payment = new Payment(amount, currency, paymentPayload)

        this._paymentRepository.notify(service, payment)
    }

    private verify(verification: string): boolean {
        for (const verificationToken of this.verificationTokens) {
            if (this.verifyToken(verification, verificationToken)) {
                return true
            }
        }

        return false;
    }

    private verifyToken(verification: string, verificationToken: string): boolean {
        const values = verification.split('&')

        const hash = values.pop()
        let parameters = values.join('&')

        parameters = parameters.replace('notification_secret', verificationToken)
        const parametersHash = this.hash(parameters)

        return parametersHash == hash
    }

    private hash(data: string) {
        return createHash('sha1')
            .update(data)
            .digest('hex')
    }

    private createFullBaseUrl(baseURL: string): string {
        return `${baseURL}?receiver=%WALLET%&quickpay-form=shop&paymentType=%TYPE%&sum=%SUM%&label=%PAYLOAD%`
    }
}