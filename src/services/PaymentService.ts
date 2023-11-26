import IBillingService from "./interfaces/IBillingService";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import DomainError from "../errors/DomainError";
import IPaymentService from "./interfaces/IPaymentService";
import GenerateLinkFromEmailParameters from "./parameters/GenerateLinkFromEmailParameters";
import IRepository from "../infrastructure/interfaces/IRepository";
import User from "../models/User";
import PaymentMessage from "../models/messages/PaymentMessage";
import Payment from "../models/Payment";
import ConfirmPaymentParameters from "./parameters/ConfirmPaymentParameters";
import {DateTime} from "luxon";
import Subscription from "../models/Subscription";
import PaymentType from "../models/enums/PaymentType";
import ISubscriptionService from "./interfaces/ISubscriptionService";
import IEmailService from "./interfaces/IEmailService";
import IMessageBroker from "../infrastructure/interfaces/IMessageBroker";
import PaymentDetails from "../models/PaymentDetails";
import PaymentStatus from "../models/enums/PaymentStatus";
import AutoRenewStatus from "../models/enums/AutoRenewStatus";
import ILogger from "../infrastructure/interfaces/ILogger";
import ILoggerFactory from "../infrastructure/interfaces/ILoggerFactory";
import ICrmService from "./interfaces/ICrmService";
import FiscalData from "./parameters/FiscalData";
import ICachedRepository from "../infrastructure/interfaces/ICachedRepository";
import PlanV2 from "../models/PlanV2";

@injectable()
export default class PaymentService implements IPaymentService {
    private DEFAULT_EMAIL_SOURCE = 'website'
    private DEFAULT_AUTO_RENEW_PLAN_ID = 'ok_vpn_1_month'

    @inject(TYPES.YookassaService) private _yookassaService: IBillingService
    @inject(TYPES.Repository) private _repository: IRepository
    @inject(TYPES.SubscriptionService) private _subscriptionService: ISubscriptionService
    @inject(TYPES.EmailService) private _emailService: IEmailService
    @inject(TYPES.MessageBroker) private _messageBroker: IMessageBroker
    @inject(TYPES.CrmService) private _crmService: ICrmService
    private readonly _logger: ILogger
    private readonly _defaultAutoRenewPlan: PlanV2

    constructor(@inject(TYPES.CachedRepository) private _cachedRepository: ICachedRepository,
                @inject(TYPES.LoggerFactory) loggerFactory: ILoggerFactory) {
        this._defaultAutoRenewPlan = _cachedRepository.getPlanById(this.DEFAULT_AUTO_RENEW_PLAN_ID)
        this._logger = loggerFactory.create("payment-service")
    }

    async generatePayment(parameters: GenerateLinkParameters): Promise<{ id: number, link: string }> {
        const { userId, planId, paymentMethod, subscriptionId, returnUrl } = parameters

        const provider = this.getProviderFromPaymentMethod(paymentMethod)

        const plan = this._cachedRepository.getPlanById(planId)
        if (plan == null)
            throw new DomainError("Incorrect plan")

        const paymentType = subscriptionId ? PaymentType.Renew : PaymentType.New
        const payment = new Payment(0, plan.price, userId, subscriptionId, plan, paymentType)
        await this._repository.createPayment(payment)

        const user = await this._repository.getUserById(userId)
        const fiscalData = {
            email: user.email ? user.email : user.telegramId ? `${user.telegramId}@telegram.com` : 'support@okvpn.io',
            description: `Подписка на ${plan.name}`
        } as FiscalData
        const link = await provider.generateLink(plan.price, payment.id, returnUrl, fiscalData)

        return { id: payment.id, link }
    }

    async generatePaymentFromEmail(parameters: GenerateLinkFromEmailParameters): Promise<string> {
        const { planId, paymentMethod, email, returnUrl } = parameters

        const plan = this._cachedRepository.getPlanById(planId)
        if (plan == null)
            throw new DomainError("Incorrect plan")

        const provider = this.getProviderFromPaymentMethod(paymentMethod)

        let user = await this._repository.getUserByEmail(email)
        if (user == null) {
            user = new User(0, null, null, this.DEFAULT_EMAIL_SOURCE, email)
            await this._repository.createUser(user)
        }

        const payment = new Payment(0, plan.price, user.id, null, plan, PaymentType.New)
        await this._repository.createPayment(payment)

        const fiscalData = {
            email,
            description: `Подписка на ${plan.name}`
        } as FiscalData
        return await provider.generateLink(plan.price, payment.id, returnUrl, fiscalData)
    }

    async confirmPayment(parameters: ConfirmPaymentParameters): Promise<void> {
        const { uuid, amount, currency, paymentId, paymentDetails } = parameters

        const payment = await this._repository.getPaymentById(paymentId)
        if (payment == null)
            throw new DomainError('Payment not found')

        const provider = this.getProviderFromPaymentMethod(paymentDetails.billingProvider)
        if (!provider.verify(payment.amount, amount, currency))
            throw new DomainError('Payment verification failed')

        if (payment.status != 'created')
            return

        payment.status = PaymentStatus.Paid
        payment.paidAt = DateTime.utc()

        const plan = payment.plan

        const subscription = payment.type == PaymentType.New
            ? await this._subscriptionService.createSubscription(payment.userId, plan)
            : await this._subscriptionService.renewSubscription(payment.entityId, plan)

        let paymentDetailsModel: PaymentDetails;
        if (paymentDetails?.isSaved) {
            paymentDetailsModel = new PaymentDetails(0, subscription.userId, paymentDetails.billingProvider, paymentDetails.paymentMethod, paymentDetails.secret)
            subscription.setAutoRenewStatus(AutoRenewStatus.Enabled)
        }

        await this._repository.updatePaymentAndSubscription(payment, subscription, paymentDetailsModel)
        await this.notifyAboutSubscription(subscription, payment.type)

        if (payment.type == PaymentType.New)
            await this._crmService.writeSubscription(subscription)
        else
            await this._crmService.updateSubscription(subscription)
    }

    public async autoRenewSubscription(subscription: Subscription) {
        const userId = subscription.userId
        const userPaymentDetails = await this._repository.getPaymentDetailsByUserId(userId)
        if (!userPaymentDetails)
            return false

        const provider = this.getProviderFromPaymentMethod(userPaymentDetails.billingProvider)
        const amount = this._defaultAutoRenewPlan.price
        const success = await provider.makeAutoPayment(userPaymentDetails.secret, amount)

        const status = success ? PaymentStatus.Paid : PaymentStatus.Failed
        const payment = new Payment(0, amount, userId, subscription.id, this._defaultAutoRenewPlan, PaymentType.AutoRenew, status, DateTime.utc(), DateTime.utc())

        if (success) {
            const renewedSubscription = await this._subscriptionService.renewSubscription(subscription.id, this._defaultAutoRenewPlan)
            await this._repository.updatePaymentAndSubscription(payment, renewedSubscription)
            await this.notifyAboutSubscription(subscription, payment.type)
            this._logger.info(`Auto payment succeeded for user #${userId}`)
        } else {
            await this._repository.createPayment(payment)
            this._logger.info(`Auto payment failed for user #${userId}`)
        }

        return success
    }

    private getProviderFromPaymentMethod(paymentMethod: string): IBillingService {
        if (paymentMethod == "yookassa") {
            return this._yookassaService
        }

        throw new DomainError("Incorrect payment method")
    }

    private async notifyAboutSubscription(subscription: Subscription, paymentType: PaymentType) {
        const user = await this._repository.getUserById(subscription.userId)

        const paymentMessage = new PaymentMessage(subscription.id, paymentType)
        this._messageBroker.notify(paymentMessage)

        if (user.email != null) {
            await this._emailService.sendSubscription(user.email, subscription, paymentType)
        }
    }
}