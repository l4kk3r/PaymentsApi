import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import IRepository from "../infrastructure/interfaces/IRepository";
import AutoRenewStatus from "../models/enums/AutoRenewStatus";
import Subscription from "../models/Subscription";
import IMessageBroker from "../infrastructure/interfaces/IMessageBroker";
import {DateTime, Duration} from "luxon";
import PaymentStatus from "../models/enums/PaymentStatus";
import PaymentType from "../models/enums/PaymentType";
import IPaymentService from "../services/interfaces/IPaymentService";
import FailedSubscriptionAutoRenewMessage from "../models/messages/FailedSubscriptionAutoRenewMessage";
import IJob from "./interfaces/IJob";
import ILoggerFactory from "../infrastructure/interfaces/ILoggerFactory";
import ILogger from "../infrastructure/interfaces/ILogger";
import IEmailService from "../services/interfaces/IEmailService";

@injectable()
export default class RenewJob implements IJob {
    private RETRY_PERIOD = Duration.fromObject({ day: 1 })
    private ALLOWED_STATUSES = [AutoRenewStatus.Enabled, AutoRenewStatus.Retry]

    @inject(TYPES.Repository) _repository: IRepository;
    @inject(TYPES.PaymentService) _paymentService: IPaymentService;
    @inject(TYPES.EmailService) _emailService: IEmailService;
    @inject(TYPES.MessageBroker) _messageBroker: IMessageBroker;
    private readonly _logger: ILogger

    constructor(@inject(TYPES.LoggerFactory) loggerFactory: ILoggerFactory) {
        this._logger = loggerFactory.create("renew-job")
    }

    async run() {
        const subscriptions = await this._repository.getExpiredSubscriptions(this.ALLOWED_STATUSES)
        const tasks = subscriptions.map(async subscription => {
            const canMakeAutoPayment = await this.canMakeAutoPayment(subscription)
            if (!canMakeAutoPayment)
                return

            const success = await this._paymentService.autoRenewSubscription(subscription)
            if (success)
                return

            const newStatus = subscription.autoRenew == AutoRenewStatus.Enabled
                ? AutoRenewStatus.Retry
                : AutoRenewStatus.Failed
            subscription.setAutoRenewStatus(newStatus)
            await this._repository.updateSubscription(subscription)

            if (subscription.autoRenew == AutoRenewStatus.Failed) {
                await this.notifyAboutFailedSubscriptionRenew(subscription)
            }
        })

        const result = await Promise.allSettled(tasks)
        const fulfilledCount = result.filter(x => x.status == "fulfilled").length
        this._logger.info(`Renew task finished for ${tasks.length} subscriptions. Fulfilled: ${fulfilledCount}. Rejected: ${tasks.length - fulfilledCount}`)
    }

    private async notifyAboutFailedSubscriptionRenew(subscription: Subscription) {
        const user = await this._repository.getUserById(subscription.userId)
        if (user.email)
            await this._emailService.notifyAboutFailedRenew(user.email, subscription)

        const message = new FailedSubscriptionAutoRenewMessage(subscription.id)
        this._messageBroker.notify(message)
    }

    private async canMakeAutoPayment(subscription: Subscription) {
        if (subscription.autoRenew != AutoRenewStatus.Retry)
            return true

        const lastAttempt = await this._repository.getLastPaymentForSubscription(subscription.id, PaymentStatus.Failed, PaymentType.AutoRenew)
        return !lastAttempt || DateTime.utc().diff(lastAttempt.createdAt) >= this.RETRY_PERIOD
    }
}