import ISubscriptionService from "./interfaces/ISubscriptionService";
import Subscription from "../models/Subscription";
import {DateTime, Duration} from "luxon";
import RandomHex from "../utils/RandomHex";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import IRepository from "../infrastructure/interfaces/IRepository";
import DomainError from "../errors/DomainError";
import IEmailService from "./interfaces/IEmailService";
import AutoRenewStatus from "../models/enums/AutoRenewStatus";
import IEncryptionService from "./interfaces/IEncryptionService";
import PlanV2 from "../models/PlanV2";

@injectable()
export default class SubscriptionService implements ISubscriptionService {
    private readonly RENEWAL_BONUS = 'P7D'
    private readonly API_HOST: string

    @inject(TYPES.Repository) private _repository: IRepository
    @inject(TYPES.EmailService) private _emailService: IEmailService
    @inject(TYPES.EncryptionService) private _encryptionService: IEncryptionService

    constructor() {
        this.API_HOST = process.env.API_HOST
    }

    async createSubscription(userId: number, plan: PlanV2): Promise<Subscription> {
        const startDate = DateTime.utc()
        const endDate = startDate.plus(plan.duration)
        const identifier = RandomHex()

        return new Subscription(null, userId, plan, startDate, endDate, false, identifier)
    }

    async renewSubscription(subscriptionId: number, plan: PlanV2): Promise<Subscription> {
        const subscription = await this._repository.getSubscriptionById(subscriptionId)

        const endDate = subscription.endAt > DateTime.utc() ? subscription.endAt : DateTime.utc()
        const duration = plan.duration.plus(Duration.fromISO(this.RENEWAL_BONUS))
        subscription.plan = plan
        subscription.endAt = endDate.plus(duration)

        return subscription
    }

    async requestSubscriptionCancellation(email: string): Promise<void> {
        const user = await this._repository.getUserByEmail(email)
        if (!user)
            throw new DomainError('User not found')

        const subscription = await this._repository.getOldestActiveSubscriptionWithAutoRenewByUserId(user.id)
        if (!subscription)
            throw new DomainError('Subscription to cancel not found')

        const cancellationSecret = this._encryptionService.encrypt(subscription.id.toString())
        const cancellationUrl = `https://${this.API_HOST}/subscription/cancel-confirm/${cancellationSecret}`
        await this._emailService.sendSubscriptionCancellationRequest(user.email, cancellationUrl)
    }

    async confirmSubscriptionCancellation(cancellationKey: string): Promise<void> {
        let decrypted: Number
        try {
            decrypted = Number(this._encryptionService.decrypt(cancellationKey))
        } catch (e) {
            throw new DomainError('Incorrect cancellation key')
        }
        if (Number.isNaN(decrypted))
            throw new DomainError('Incorrect cancellation key')

        const subscriptionId = Number(decrypted)
        await this._repository.setSubscriptionAutoRenewStatus(subscriptionId, AutoRenewStatus.Disabled)

        const subscription = await this._repository.getSubscriptionById(subscriptionId)
        const user = await this._repository.getUserById(subscription.userId)
        const activeSubscriptionsCount = await this._repository.countActiveSubscriptionsWithAutoRenewByUserId(subscription.userId)
        await this._emailService.sendSubscriptionCancellationConfirmation(user.email, activeSubscriptionsCount)
    }
}