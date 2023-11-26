import "reflect-metadata";
import {container} from "../di/inversify.config";
import {TYPES} from "../di/types";
import IPaymentService from "../services/interfaces/IPaymentService";
import IRepository from "../infrastructure/interfaces/IRepository";
import User from "../models/User";
import {randomInt, randomUUID} from "crypto";
import Payment from "../models/Payment";
import IMessageBroker from "../infrastructure/interfaces/IMessageBroker";
import {DateTime, Duration} from "luxon";
import Subscription from "../models/Subscription";
import RandomHex from "../utils/RandomHex";
import PaymentType from "../models/enums/PaymentType";
import PaymentStatus from "../models/enums/PaymentStatus";
import AutoRenewStatus from "../models/enums/AutoRenewStatus";
import PaymentDetails from "../models/PaymentDetails";
import IJob from "../jobs/interfaces/IJob";
import {Pool} from "pg";
import PaymentMessage from "../models/messages/PaymentMessage";
import FailedSubscriptionAutoRenewMessage from "../models/messages/FailedSubscriptionAutoRenewMessage";
import ISubscriptionService from "../services/interfaces/ISubscriptionService";
import IEncryptionService from "../services/interfaces/IEncryptionService";
import ICachedRepository from "../infrastructure/interfaces/ICachedRepository";

jest.setTimeout(60000 * 5);

const DEFAULT_PAYMENT_URL = 'https://yoomoney.ru/checkout/payments/v'
const PLAN_ID = 'ok_vpn_1_month'
const PAYMENT_METHOD = 'yookassa'
const PAYMENT_SECRET = '2ce3592b-000f-5000-9000-1c9faff77b0a'
const RENEWAL_BONUS_DAYS = 7


const paymentService = container.get<IPaymentService>(TYPES.PaymentService);
const subscriptionService = container.get<ISubscriptionService>(TYPES.SubscriptionService);
const encryptionService = container.get<IEncryptionService>(TYPES.EncryptionService);
const repository = container.get<IRepository>(TYPES.Repository);
const cachedRepository = container.get<ICachedRepository>(TYPES.CachedRepository);
const messageBroker = container.get<IMessageBroker>(TYPES.MessageBroker)
const warmupMs = 1000

describe('Payment service tests', () => {
    beforeAll(async () => {
        await new Promise(resolve => setTimeout(() => resolve(5), warmupMs))
        messageBroker.purgeAll()
    })

    it('Create payment', async () => {
        // Arrange
        const user = await createUser()
        const parameters = {
            userId: user.id,
            planId: PLAN_ID,
            paymentMethod: PAYMENT_METHOD,
            returnUrl: 'return'
        }

        // Act
        const result = await paymentService.generatePayment(parameters)

        // Assert
        expect(result.link.startsWith(DEFAULT_PAYMENT_URL)).toBeTruthy()
    })

    it('Create payment from email', async () => {
        // Arrange
        const email = 'l4kk3r@yandex.ru'
        const parameters = {
            planId: PLAN_ID,
            paymentMethod: PAYMENT_METHOD,
            email,
            returnUrl: 'return'
        }

        // Act
        const result = await paymentService.generatePaymentFromEmail(parameters)

        // Assert
        expect(result.startsWith(DEFAULT_PAYMENT_URL)).toBeTruthy()
        const user = await repository.getUserByEmail(email)
        expect(user).not.toBeNull()
    })


    it('Confirm payment with new subscription and saved payment method', async () => {
        // Arrange
        const user = await getOrCreateUserWithEmail('timvaulin256@yandex.ru')
        const payment = await createPayment(user, PaymentType.New)
        const secret = randomUUID()
        const paymentParameters = createPaymentParameters(payment, secret)

        // Act
        await paymentService.confirmPayment(paymentParameters)

        // Assert
        const paymentAfterConfirmation = await repository.getPaymentById(payment.id)
        expect(paymentAfterConfirmation.status).toBe(PaymentStatus.Paid)
        expect(paymentAfterConfirmation.paidAt).not.toBeNull()

        const subscription = await getUserSubscription(user)
        const expectedMessage = new PaymentMessage(subscription.id, payment.type)
        await expectPaymentMessageToBeEqual(expectedMessage)

        const plan = subscription.plan
        expect(subscription.userId).toBe(user.id)
        expect(subscription.plan.id).toBe(PLAN_ID)
        const dif = Math.abs(subscription.endAt.diff(DateTime.utc().plus(plan.duration), 'hours').hours)
        expect(dif < 1).toBeTruthy()

        const paymentDetails = await repository.getPaymentDetailsByUserId(user.id)
        expect(paymentDetails).not.toBeNull()
        expect(paymentDetails.userId).toBe(user.id)
        expect(paymentDetails.secret).toBe(secret)
    })

    it('Confirm payment with renew subscription', async () => {
        // Arrange
        const user = await createUser()
        const subscription = await createSubscription(user)
        const payment = await createPayment(user, PaymentType.Renew, subscription)
        const paymentParameters = createPaymentParameters(payment)

        // Act
        await paymentService.confirmPayment(paymentParameters)

        // Assert
        const paymentAfterConfirmation = await repository.getPaymentById(payment.id)
        expect(paymentAfterConfirmation.status).toBe('paid')
        expect(paymentAfterConfirmation.paidAt).not.toBeNull()

        const expectedMessage = new PaymentMessage(subscription.id, payment.type)
        await expectPaymentMessageToBeEqual(expectedMessage)

        const renewedSubscription = await repository.getSubscriptionById(subscription.id)
        expectSubscriptionToBeRenewed(renewedSubscription, subscription.endAt)
    })

    it('Auto renew subscription', async () => {
        // Assert
        const user = await createUser()
        await createPaymentDetails(user, PAYMENT_SECRET)
        const subscription = await createSubscription(user, AutoRenewStatus.Enabled)
        const renewJob = container.get<IJob>(TYPES.RenewJob)

        // Act
        await renewJob.run()

        // Assert
        const renewedSubscription = await repository.getSubscriptionById(subscription.id)
        expect(renewedSubscription.autoRenew).toBe(AutoRenewStatus.Enabled)
        expectSubscriptionToBeRenewed(renewedSubscription, subscription.endAt)

        const payment = await repository.getLastPaymentForSubscription(renewedSubscription.id, PaymentStatus.Paid, PaymentType.AutoRenew)
        expect(payment).not.toBeNull()

        const expectedMessage = new PaymentMessage(subscription.id, PaymentType.AutoRenew)
        await expectPaymentMessageToBeEqual(expectedMessage)
    })

    it('Failed to auto renew subscription with wrong secret', async () => {
        // Assert
        const user = await createUser()
        const paymentDetails = await createPaymentDetails(user, randomUUID())
        const subscription = await createSubscription(user, AutoRenewStatus.Enabled)
        const renewJob = container.get<IJob>(TYPES.RenewJob)

        // Act
        await renewJob.run()

        // Assert
        const renewedSubscription = await repository.getSubscriptionById(subscription.id)
        expect(renewedSubscription.autoRenew).toBe(AutoRenewStatus.Retry)
        expect(renewedSubscription.endAt).toStrictEqual(subscription.endAt)

        const payment = await repository.getLastPaymentForSubscription(renewedSubscription.id, PaymentStatus.Failed, PaymentType.AutoRenew)
        expect(payment).not.toBeNull()
        expect(payment.status).toBe(PaymentStatus.Failed)
        expect(payment.paidAt).toBeNull()
    })

    it('Double failed to auto renew subscription with wrong secret', async () => {
        // Assert
        const user = await createUser()
        const paymentDetails = await createPaymentDetails(user, randomUUID())
        const subscription = await createSubscription(user, AutoRenewStatus.Enabled)
        const renewJob = container.get<IJob>(TYPES.RenewJob)

        // Act
        await renewJob.run()
        const failedPayment = await repository.getLastPaymentForSubscription(subscription.id, PaymentStatus.Failed, PaymentType.AutoRenew)
        await updatePaymentCreatedAt(failedPayment, DateTime.utc().minus({ day: 1 }))
        await renewJob.run()

        // Assert
        const renewedSubscription = await repository.getSubscriptionById(subscription.id)
        expect(renewedSubscription.autoRenew).toBe(AutoRenewStatus.Failed)
        expect(renewedSubscription.endAt).toStrictEqual(subscription.endAt)

        const payment = await repository.getLastPaymentForSubscription(renewedSubscription.id, PaymentStatus.Failed, PaymentType.AutoRenew)
        expect(payment).not.toBeNull()
        expect(payment.status).toBe(PaymentStatus.Failed)
        expect(payment.paidAt).toBeNull()

        const expectedMessage = new FailedSubscriptionAutoRenewMessage(renewedSubscription.id)
        await expectFailedAutoRenewMessageToBeEqual(expectedMessage)
    })

    it('Cancel subscription by link', async () => {
        // Assert
        const user = await getOrCreateUserWithEmail('l4kk3r@yandex.ru')
        const subscription = await createSubscription(user, AutoRenewStatus.Enabled)
        const cancellationKey = encryptionService.encrypt(subscription.id.toString())

        // Act
        await subscriptionService.confirmSubscriptionCancellation(cancellationKey)

        // Assert
        const updatedSubscription = await repository.getSubscriptionById(subscription.id)
        expect(updatedSubscription.autoRenew).toBe(AutoRenewStatus.Disabled)
    })

    // Verify there are no additional messages']
    afterAll(async () => {
        const messages = await Promise.all([
            messageBroker.getPaymentMessage(false),
            messageBroker.getFailedAutoRenewMessage(false)
        ])
        const notNullMessage = messages.filter(x => x != null)

        expect(notNullMessage.length).toBe(0)
    })
})

const createUser = async () => {
    const user = new User(0, randomInt(1, 1000000), randomUUID())
    await repository.createUser(user)
    return user
}

const getOrCreateUserWithEmail = async (email: string) => {
    const userWithSameEmail = await repository.getUserByEmail(email)
    if (userWithSameEmail)
        return userWithSameEmail

    const user = new User(0, randomInt(1, 1000000), randomUUID())
    user.email = email
    await repository.createUser(user)
    return user
}

const createPayment = async (user: User, type: PaymentType, subscription?: Subscription) => {
    const plan = cachedRepository.getPlanById(PLAN_ID)
    const payment = new Payment(0, plan.price, user.id, subscription?.id, plan, type)
    await repository.createPayment(payment)
    return payment
}

const createPaymentDetails = async (user: User, secret: string) => {
    const pool = container.get<Pool>(TYPES.DatabasePool)
    await pool.query(
        'DELETE FROM payment_details WHERE secret=$1',
        [PAYMENT_SECRET]
    )

    const paymentDetails = new PaymentDetails(0, user.id, PAYMENT_METHOD, 'yoo_money', secret)
    await repository.createPaymentDetails(paymentDetails)
    return paymentDetails
}

const getUserSubscription = async (user: User) => {
    const pool = container.get<Pool>(TYPES.DatabasePool)
    const result = await pool.query(
        'SELECT id FROM subscriptions WHERE user_id=$1 ORDER BY id DESC LIMIT 1',
        [user.id]
    )

    const id = result.rows[0].id

    return repository.getSubscriptionById(id)
}

const createSubscription = async (user: User, autoRenewStatus: AutoRenewStatus = AutoRenewStatus.Disabled) => {
    const plan = cachedRepository.getPlanById(PLAN_ID)
    const subscription = new Subscription(0, user.id, plan, DateTime.utc(), DateTime.utc(), false, RandomHex(), autoRenewStatus)
    await repository.createSubscription(subscription)
    return subscription
}

const updatePaymentCreatedAt = async (payment: Payment, date: DateTime) => {
    const pool = container.get<Pool>(TYPES.DatabasePool)
    const result = await pool.query(
        'UPDATE payments SET created_at=$1 WHERE id=$2',
        [date, payment.id]
    )
}

const createPaymentParameters = (payment: Payment, secret?: string) => ({
        uuid: randomUUID(),
        paymentId: payment.id,
        amount: cachedRepository.getPlanById(PLAN_ID).price,
        currency: 'RUB',
        paymentDetails: {
            billingProvider: PAYMENT_METHOD,
            paymentMethod: 'card',
            secret,
            isSaved: !!secret
        }
})

const expectSubscriptionToBeRenewed = (subscription: Subscription, previousEndAt: DateTime) => {
    const plan = subscription.plan
    const expectedEndAt = previousEndAt.plus(plan.duration).plus({ day: RENEWAL_BONUS_DAYS })
    const dif = Math.abs(subscription.endAt.diff(expectedEndAt, 'hours').hours)
    expect(dif < 1).toBeTruthy()
}

const expectPaymentMessageToBeEqual = async (expectedMessage: PaymentMessage) => {
    const message = await messageBroker.getPaymentMessage(true)
    expect(message).not.toBeNull()
    expect(expectedMessage.equals(message)).toBeTruthy()
}

const expectFailedAutoRenewMessageToBeEqual = async (expectedMessage: FailedSubscriptionAutoRenewMessage) => {
    const message = await messageBroker.getFailedAutoRenewMessage(true)
    expect(message).not.toBeNull()
    expect(expectedMessage.equals(message)).toBeTruthy()
}
