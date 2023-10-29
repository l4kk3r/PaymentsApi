import IYookassaService from "./interfaces/IYookassaService";
import ConfirmPaymentParameters from "./parameters/ConfirmPaymentParameters";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import 'axios'
import axios, {AxiosInstance} from "axios";
import {inject, injectable} from "inversify";
import {randomUUID} from "crypto";
import PaymentMessage from "../models/PaymentMessage";
import {TYPES} from "../di/types";
import IPaymentRepository from "../repositories/interfaces/IPaymentRepository";
import IEmailService from "./interfaces/IEmailService";
import IRepository from "../repositories/interfaces/IRepository";
import PaymentType from "../models/PaymentType";
import Subscription from "../models/Subscription";
import GetPlanById from "../utils/GetPlanById";
import {DateTime, Duration} from "luxon";
import DomainError from "../errors/DomainError";
import User from "../models/User";
import RandomHex from "../utils/RandomHex";

@injectable()
export default class YookassaService implements IYookassaService {
    @inject(TYPES.IEmailService) private _emailService: IEmailService
    @inject(TYPES.IRepository) private _repository: IRepository

    private AMOUNT_COEFFICIENT = 0.9
    private RENEWAL_BONUS = "P7D"

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
        const paymentId = Number(payloadData[0])

        const payment = await this._repository.getPaymentById(paymentId)
        if (payment == null)
            throw new DomainError('Payment not found')

        if (payment.status != 'created')
            return

        payment.status = 'paid'
        payment.paidAt = DateTime.utc()
        await this._repository.updatePayment(payment)

        const user = await this._repository.getUserById(payment.userId)
        let subscription: Subscription
        let paymentType = payment.type
        if (payment.type == PaymentType.New) {
            subscription = await this.createSubscription(payment.planId, user)
        } else {
            subscription = await this._repository.getSubscriptionById(payment.entityId)
            if (this.isExpired(subscription)) {
                paymentType = PaymentType.New
                subscription = await this.createSubscription(payment.planId, user)
            } else {
                await this.renewSubscription(payment.planId, subscription)
            }
        }

        if (user.email != null) {
            await this._emailService.notifyAboutSubscription(user, subscription)
        }

        if (user.telegramId != null) {
            const paymentMessage = new PaymentMessage(subscription.id, paymentType)
            this._paymentRepository.notify(service, paymentMessage)
        }
    }

    async generateLink(generateParameters: GenerateLinkParameters): Promise<string> {
        const {paymentMethod, amount, service, payload, currency, returnUrl} = generateParameters
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
            confirmation: {
                type: 'redirect',
                return_url: returnUrl ?? this.RETURN_URL
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

    private async createSubscription(planId: string, user: User) {
        const plan = GetPlanById(planId)
        const startDate = DateTime.now()
        const endDate = startDate.plus(Duration.fromISO(plan.duration))
        const identifier = RandomHex()

        const subscription = new Subscription(0, user.id, plan.id, startDate, endDate, false, identifier)
        await this._repository.createSubscription(subscription)

        return subscription
    }

    private async renewSubscription(planId: string, subscription: Subscription) {
        const plan = GetPlanById(planId)

        subscription.planId = plan.id
        const duration = Duration.fromISO(plan.duration).plus(Duration.fromISO(this.RENEWAL_BONUS))
        subscription.endAt = subscription.endAt.plus(duration)

        await this._repository.updateSubscription(subscription)
        await this._repository.emptyNotificationsBySubscriptionId(subscription.id)
    }

    private isExpired = (subscription: Subscription) => subscription.endAt < DateTime.utc()
}