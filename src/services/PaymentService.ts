import IBillingService from "./interfaces/IBillingService";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import DomainError from "../errors/DomainError";
import IPaymentService from "./interfaces/IPaymentService";
import GenerateLinkFromEmailParameters from "./parameters/GenerateLinkFromEmailParameters";
import IRepository from "../infrastructure/interfaces/IRepository";
import User from "../models/User";
import PaymentMessage from "../models/PaymentMessage";
import Payment from "../models/Payment";
import GetPlanById from "../utils/GetPlanById";
import ConfirmPaymentParameters from "./parameters/ConfirmPaymentParameters";
import {DateTime} from "luxon";
import Subscription from "../models/Subscription";
import PaymentType from "../models/PaymentType";
import ISubscriptionService from "./interfaces/ISubscriptionService";
import IEmailService from "./interfaces/IEmailService";
import IMessageBroker from "../infrastructure/interfaces/IMessageBroker";
import PaymentDetails from "../models/PaymentDetails";

@injectable()
export default class PaymentService implements IPaymentService {
    private DEFAULT_EMAIL_SOURCE = 'website'

    @inject(TYPES.YookassaService) private _yookassaService: IBillingService
    @inject(TYPES.Repository) private _repository: IRepository
    @inject(TYPES.SubscriptionService) private _subscriptionService: ISubscriptionService
    @inject(TYPES.EmailService) private _emailService: IEmailService
    @inject(TYPES.MessageBroker) private _messageBroker: IMessageBroker

    async generatePayment(parameters: GenerateLinkParameters): Promise<{ id: number, link: string }> {
        const { userId, planId, paymentMethod, subscriptionId, returnUrl } = parameters

        const provider = this.getProviderFromPaymentMethod(paymentMethod)

        const plan = GetPlanById(planId)
        if (plan == null)
            throw new DomainError("Incorrect plan")

        const paymentType = subscriptionId ? 'renew' : 'new'
        const payment = new Payment(0, plan.price, userId, subscriptionId, planId, paymentType)
        await this._repository.createPayment(payment)
        const link = await provider.generateLink(plan.price, payment.id, returnUrl)

        return { id: payment.id, link }
    }

    async generatePaymentFromEmail(parameters: GenerateLinkFromEmailParameters): Promise<string> {
        const { planId, paymentMethod, email, returnUrl } = parameters

        const plan = GetPlanById(planId)
        if (plan == null)
            throw new DomainError("Incorrect plan")

        const provider = this.getProviderFromPaymentMethod(paymentMethod)

        let user = await this._repository.getUserByEmail(email)
        if (user == null) {
            user = new User(0, null, null, this.DEFAULT_EMAIL_SOURCE, email)
            await this._repository.createUser(user)
        }

        const payment = new Payment(0, plan.price, user.id, null, planId, 'new')
        await this._repository.createPayment(payment)

        return await provider.generateLink(plan.price, payment.id, returnUrl)
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

        payment.status = 'paid'
        payment.paidAt = DateTime.utc()

        const plan = GetPlanById(payment.planId)

        const subscription = payment.type == PaymentType.New
            ? await this._subscriptionService.createSubscription(payment.userId, plan)
            : await this._subscriptionService.renewSubscription(payment.entityId, plan)

        const paymentDetailsModel = paymentDetails?.isSaved && !(await this._repository.getPaymentDetailsBySecret(paymentDetails.secret))
            ? new PaymentDetails(0, subscription.userId, paymentDetails.billingProvider, paymentDetails.paymentMethod, paymentDetails.secret)
            : null


        await this._repository.updatePaymentAndSubscription(payment, subscription, paymentDetailsModel)
        await this.notifyAboutSubscription(subscription, payment.type)
    }

    private getProviderFromPaymentMethod(paymentMethod: string): IBillingService {
        if (paymentMethod == "yookassa") {
            return this._yookassaService
        }

        throw new DomainError("Incorrect payment method")
    }

    private async notifyAboutSubscription(subscription: Subscription, paymentType: string) {
        const user = await this._repository.getUserById(subscription.userId)

        const paymentMessage = new PaymentMessage(subscription.id, paymentType)
        this._messageBroker.notify(paymentMessage)

        if (user.email != null) {
            await this._emailService.notifyAboutSubscription(user.email, subscription)
        }
    }
}