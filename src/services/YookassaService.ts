import IYookassaService from "./interfaces/IYookassaService";
import 'axios'
import axios, {AxiosError, AxiosInstance} from "axios";
import {inject, injectable} from "inversify";
import {randomUUID} from "crypto";
import {TYPES} from "../di/types";
import IMessageBroker from "../infrastructure/interfaces/IMessageBroker";
import ILogger from "../infrastructure/interfaces/ILogger";
import ILoggerFactory from "../infrastructure/interfaces/ILoggerFactory";

@injectable()
export default class YookassaService implements IYookassaService {
    private DEFAULT_CURRENCY = 'RUB'
    private AMOUNT_COEFFICIENT = 0.9

    private readonly _api: AxiosInstance
    private readonly _isAutoPaymentsEnabled: boolean
    private readonly _fiscalEnabled: boolean

    private readonly _logger: ILogger

    constructor(@inject(TYPES.LoggerFactory) loggerFactory: ILoggerFactory) {
        const apiUrl = process.env.YOOKASSA_API_URL
        const shopId = process.env.YOOKASSA_SHOP_ID
        const shopSecret = process.env.YOOKASSA_SECRET_KEY
        this._isAutoPaymentsEnabled = JSON.parse(process.env.AUTO_PAYMENTS)
        this._fiscalEnabled = JSON.parse(process.env.FISCAL_ENABLED)

        this._api = axios.create({
            baseURL: apiUrl,
            headers: {
                'Authorization': `Basic ${Buffer.from(shopId + ':' + shopSecret).toString('base64')}`
            }
        })
        this._logger = loggerFactory.create("yookassa-service")
    }

    async makeAutoPayment(secret: string, amount: number): Promise<boolean> {
        try {
            const payment = {
                amount: {
                    currency: this.DEFAULT_CURRENCY,
                    value: amount
                },
                descirption: 'Автоматическое продление',
                payment_method_id: secret,
                capture: true
            }

            const result = await this._api.post("", payment, {
                headers: {
                    'Idempotence-Key': randomUUID()
                }
            })

            return result.data.status == "succeeded";
        } catch (e) {
            // If payment method was declined
            if (e instanceof AxiosError && (e.response?.status < 500)) {
                return false;
            }
            this._logger.error(e.message)
            throw e;
        }
    }

    async generateLink(amount: number, paymentId: number, returnUrl: string): Promise<string> {
        const payment = {
            amount: {
                currency: this.DEFAULT_CURRENCY,
                value: amount
            },
            metadata: {
                paymentId
            },
            confirmation: {
                type: 'redirect',
                return_url: returnUrl
            },
            capture: true,
            save_payment_method: this._isAutoPaymentsEnabled
        }

/*        if (this._fiscalEnabled) {
            payment.
        }*/

        const result = await this._api.post("", payment, {
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