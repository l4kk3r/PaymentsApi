import IPaymentService from "./interfaces/IPaymentService";
import {inject, injectable} from "inversify";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import axios, {AxiosInstance} from "axios";
import ConfirmPaymentParameters from "./parameters/ConfirmPaymentParameters";
import jwt, {Jwt, JwtPayload} from "jsonwebtoken";
import DomainError from "../errors/DomainError";
import PaymentMessage from "../models/PaymentMessage";
import {TYPES} from "../di/types";
import IPaymentRepository from "../repositories/interfaces/IPaymentRepository";
import ICryptoService from "./interfaces/ICryptoService";
import ICryptoCloudService from "./interfaces/ICryptoCloudService";

@injectable()
export default class CryptoCloudService implements ICryptoCloudService, ICryptoService {
    private readonly shopId: string
    private readonly verificationToken: string
    private readonly api: AxiosInstance

    @inject(TYPES.IPaymentRepository) private _paymentRepository: IPaymentRepository

    constructor() {
        this.shopId = process.env.CRYPTOCLOUD_SHOP_ID
        this.verificationToken = process.env.CRYPTOCLOUD_VERIFICATION_TOKEN

        const token = process.env.CRYPTOCLOUD_TOKEN
        const baseURL = process.env.CRYPTOCLOUD_BASE_URL
        this.api = this.createApiInstance(baseURL, token)
    }

    async generateLink(parameters: GenerateLinkParameters): Promise<string> {
        const { amount, currency, service, payload } = parameters

        const fullPayload = `${service}:${payload}`
        const data = {
            shop_id: this.shopId,
            amount,
            currency,
            order_id: fullPayload
        }

        const response = await this.api.post('/invoice/create', data)
        return response.data['pay_url']
    }

    async confirmPayment(parameters: ConfirmPaymentParameters): Promise<void> {
        const { uuid, amount, currency, payload, verification } = parameters

        const verified = this.verify(uuid, verification)
        if (!verified)
            throw new DomainError("Incorrect verification")

        const payloadData = payload.split(':')
        const service = payloadData.shift()
        const paymentPayload = payloadData.join(':')
        const payment = new PaymentMessage(amount, currency, paymentPayload)

        this._paymentRepository.notify(service, payment)
    }

    private verify(uuid: string, verification: string): boolean {
        try {
            const result = jwt.verify(verification, this.verificationToken) as JwtPayload
            return result.id == uuid
        } catch {
            return false
        }
    }

    private createApiInstance(baseURL: string, token: string): AxiosInstance {
        return axios.create({
            baseURL,
            headers: {
                Authorization: `Token ${token}`
            }
        })
    }
}