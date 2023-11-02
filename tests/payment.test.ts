import "reflect-metadata";
require('dotenv').config()

import { container} from "../src/di/inversify.config";
import {TYPES} from "../src/di/types";
import IPaymentService from "../src/services/interfaces/IPaymentService";
import IRepository from "../src/infrastructure/interfaces/IRepository";
import User from "../src/models/User";
import {randomInt, randomUUID} from "crypto";
import Payment from "../src/models/Payment";
import IMessageBroker from "../src/infrastructure/interfaces/IMessageBroker";
import {DateTime, Duration} from "luxon";
import GetPlanById from "../src/utils/GetPlanById";
import Subscription from "../src/models/Subscription";
import RandomHex from "../src/utils/RandomHex";


jest.setTimeout(60000);

const DEFAULT_PAYMENT_URL = 'https://yoomoney.ru/checkout/payments/v'
const PLAN_ID = 'ok_vpn_1_month'
const PAYMENT_METHOD = 'yookassa'
const RENEWAL_BONUS = 7 * 24

describe('Payment service tests', () => {
    const paymentService = container.get<IPaymentService>(TYPES.PaymentService);
    const repository = container.get<IRepository>(TYPES.Repository);

    it('Create payment', async () => {
        // Arrange
        const user = new User(0, randomInt(0, 1000), randomUUID())
        await repository.createUser(user)
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


    it('Confirm payment with new subscription', async () => {
        // Arrange
        const user = new User(0, randomInt(1, 1000000), randomUUID(), null)
        await repository.createUser(user)
        const payment = new Payment(0, 149, user.id, null, PLAN_ID, 'new')
        await repository.createPayment(payment)
        const secret = randomUUID()

        // Act
        await paymentService.confirmPayment({
            uuid: randomUUID(),
            paymentId: payment.id,
            amount: 149,
            currency: 'RUB',
            paymentDetails: {
                billingProvider: PAYMENT_METHOD,
                paymentMethod: 'card',
                secret,
                isSaved: true
            }
        })

        // Assert
        const paymentAfterConfirmation = await repository.getPaymentById(payment.id)
        expect(paymentAfterConfirmation.status).toBe('paid')
        expect(paymentAfterConfirmation.paidAt).not.toBeNull()
        const messageBroker = container.get<IMessageBroker>(TYPES.MessageBroker)
        const message = await messageBroker.getLatestMessage(false)
        expect(message).not.toBeNull()
        expect(message.subscriptionId).not.toBeNull()
        expect(message.type).toBe('new')
        const subscription = await repository.getSubscriptionById(message.subscriptionId)
        const plan = GetPlanById(subscription.planId)
        expect(subscription.userId).toBe(user.id)
        expect(subscription.planId).toBe(PLAN_ID)
        const dif = subscription.endAt.diff(DateTime.utc().plus(Duration.fromISO(plan.duration)), 'hours').hours
        expect(dif < 1).toBeTruthy()
        const paymentDetails = await repository.getPaymentDetailsByUserId(user.id)
        expect(paymentDetails.length).toBe(1)
        expect(paymentDetails[0].userId).toBe(user.id)
        expect(paymentDetails[0].secret).toBe(secret)
    })

    it('Confirm payment with renew subscription', async () => {
        // Arrange
        const user = new User(0, randomInt(1, 1000000), randomUUID())
        await repository.createUser(user)
        const subscription = new Subscription(0, user.id, PLAN_ID, DateTime.utc(), DateTime.utc(), false, RandomHex())
        await repository.createSubscription(subscription)
        const payment = new Payment(0, 149, user.id, subscription.id, PLAN_ID, 'renew')
        await repository.createPayment(payment)

        // Act
        await paymentService.confirmPayment({
            uuid: randomUUID(),
            paymentId: payment.id,
            amount: 149,
            currency: 'RUB',
            paymentDetails: {
                billingProvider: PAYMENT_METHOD
            }
        })

        // Assert
        const paymentAfterConfirmation = await repository.getPaymentById(payment.id)
        expect(paymentAfterConfirmation.status).toBe('paid')
        expect(paymentAfterConfirmation.paidAt).not.toBeNull()
        const messageBroker = container.get<IMessageBroker>(TYPES.MessageBroker)
        const message = await messageBroker.getLatestMessage(false)
        expect(message).not.toBeNull()
        expect(message.subscriptionId).toBe(subscription.id)
        expect(message.type).toBe('renew')
        const subscriptionRenewed = await repository.getSubscriptionById(subscription.id)
        const plan = GetPlanById(PLAN_ID)
        const dif = subscriptionRenewed.endAt.diff(subscription.endAt.plus(Duration.fromISO(plan.duration)), 'hours').hours
        expect(dif < RENEWAL_BONUS + 1).toBeTruthy()
    })
})