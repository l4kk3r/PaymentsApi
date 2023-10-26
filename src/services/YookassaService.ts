import IYookassaService from "./interfaces/IYookassaService";
import ConfirmPaymentParameters from "./parameters/ConfirmPaymentParameters";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import 'axios'
import axios, {AxiosInstance} from "axios";
import {inject, injectable} from "inversify";
import {randomUUID} from "crypto";
import DomainError from "../errors/DomainError";
import Payment from "../models/Payment";
import {TYPES} from "../di/types";
import IPaymentRepository from "../repositories/interfaces/IPaymentRepository";

@injectable()
export default class YookassaService implements IYookassaService {
    private RETURN_URL: string = 'https://t.me/okvpn_xbot'

    private readonly api: AxiosInstance
    private readonly allowedIps: string[]

    @inject(TYPES.IPaymentRepository) private _paymentRepository: IPaymentRepository

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

    async confirmPayment(parameters: ConfirmPaymentParameters): Promise<void> {
        const { uuid, amount, currency, payload, verification } = parameters

        /*
        if (!this.allowedIps.includes(parameters.verification))
            throw new DomainError("Incorrect verification") */

        const payloadData = payload.split(':')
        const service = payloadData.shift()
        const paymentPayload = payloadData.join(':')
        const payment = new Payment(amount, currency, paymentPayload)

        this._paymentRepository.notify(service, payment)
    }

    async generateLink(generateParameters: GenerateLinkParameters): Promise<string> {
        const {paymentMethod, amount, service, payload, currency} = generateParameters
        const type = paymentMethod == 'card' ? 'AC' : 'PC'
        const fullPayload = `${service}:${payload}`
        const payment = {
            amount: {
                currency,
                value: amount
            },
            metadata: {
                payload: fullPayload
            },
            "payment_method_data": {
                "type": "bank_card"
            },
            "save_payment_method": "true",
            confirmation: {
                type: 'redirect',
                return_url: this.RETURN_URL
            },
            capture: true
        }

        try {
            const result = await this.api.post("", payment, {
                headers: {
                    'Idempotence-Key': randomUUID()
                }
            })
            return result.data.confirmation.confirmation_url;
        } catch (e) {
            console.log(`error during yookassa link generation: ${e.message}`)
        }
    }

}