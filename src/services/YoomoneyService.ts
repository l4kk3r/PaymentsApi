import IPaymentService from "./interfaces/IPaymentService";
import {inject, injectable} from "inversify";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import ConfirmPaymentParameters from "./parameters/ConfirmPaymentParameters";
import ICardService from "./interfaces/ICardService";
import IYooMoneyService from "./interfaces/IYooMoneyService";
import axios, {AxiosInstance} from "axios/index";
import DomainError from "../errors/DomainError";
import Payment from "../models/Payment";
import {TYPES} from "../di/types";
import IPaymentRepository from "../repositories/interfaces/IPaymentRepository";
import {createHash} from "crypto";

@injectable()
export default class YoomoneyService implements IYooMoneyService, ICardService {
    private readonly baseUrl: string
    private readonly verificationToken: string

    @inject(TYPES.IPaymentRepository) private _paymentRepository: IPaymentRepository

    constructor() {
        const baseUrl = process.env.YOOMONEY_BASE_URL
        const walletId = process.env.YOOMONEY_WALLET_ID

        this.baseUrl = this.createFullBaseUrl(baseUrl, walletId)
        this.verificationToken = process.env.YOOMONEY_VERIFICATION_TOKEN
    }

    async generateLink(generateParameters: GenerateLinkParameters): Promise<string> {
        const {paymentMethod, amount, service, payload} = generateParameters
        const type = paymentMethod == 'card' ? 'AC' : 'PC'
        const fullPayload = `${service}:${payload}`

        return this.baseUrl
            .replace('%TYPE%', type)
            .replace('%SUM%', amount.toString())
            .replace('%PAYLOAD%', fullPayload)
    }

    async confirmPayment(parameters: ConfirmPaymentParameters): Promise<void> {
        const { uuid, amount, currency, payload, verification } = parameters

        const verified = this.verify(verification)
        if (!verified)
            throw new DomainError("Incorrect verification")

        const [service, paymentPayload] = payload.split(':')
        const payment = new Payment(amount, currency, paymentPayload)

        this._paymentRepository.notify(service, payment)
    }

    private verify(verification: string): boolean {
        const values = verification.split('&')

        const hash = values.pop()
        let parameters = values.join('&')

        parameters = parameters.replace('notification_secret', this.verificationToken)
        const parametersHash = this.hash(parameters)

        return parametersHash == hash
    }

    private hash(data: string) {
        return createHash('sha1')
            .update(data)
            .digest('hex')
    }

    private createFullBaseUrl(baseURL: string, walletId: string): string {
        return `${baseURL}?receiver=${walletId}&quickpay-form=shop&paymentType=%TYPE%&sum=%SUM%&label=%PAYLOAD%`
    }
}