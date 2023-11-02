import IYookassaService from "./interfaces/IYookassaService";
import 'axios'
import axios, {AxiosInstance} from "axios";
import {inject, injectable} from "inversify";
import {randomUUID} from "crypto";
import {TYPES} from "../di/types";
import IMessageBroker from "../infrastructure/interfaces/IMessageBroker";

@injectable()
export default class YookassaService implements IYookassaService {
    private DEFAULT_CURRENCY = 'RUB'
    private AMOUNT_COEFFICIENT = 0.9

    private readonly api: AxiosInstance
    private readonly allowedIps: string[]

    @inject(TYPES.MessageBroker) private _paymentRepository: IMessageBroker

    constructor() {
        const apiUrl = process.env.YOOKASSA_API_URL
        const shopId = process.env.YOOKASSA_SHOP_ID
        const shopSecret = process.env.YOOKASSA_SECRET_KEY

        this.allowedIps = JSON.parse(process.env.YOOKASSA_IPS)
        this.api = axios.create({
            baseURL: apiUrl,
            headers: {
                'Authorization': `Basic ${Buffer.from(shopId + ':' + shopSecret).toString('base64')}`
            }
        })
    }

    async generateLink(amount: number, paymentId: number, returnUrl: string): Promise<string> {
        const payment = {
            amount: {
                currency: 'RUB',
                value: amount
            },
            metadata: {
                paymentId
            },
            confirmation: {
                type: 'redirect',
                return_url: returnUrl
            },
            capture: true
        }

        const result = await this.api.post("", payment, {
            headers: {
                'Idempotence-Key': randomUUID()
            }
        })

        return result.data.confirmation.confirmation_url;
    }

    verify(expectedAmount: number, realAmount: number, currency: string): boolean {
        return currency == this.DEFAULT_CURRENCY && (realAmount > expectedAmount * this.AMOUNT_COEFFICIENT)
    }
}