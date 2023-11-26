import "reflect-metadata";

import {container} from "../di/inversify.config";
import {TYPES} from "../di/types";
import {DateTime} from "luxon";
import Subscription from "../models/Subscription";
import RandomHex from "../utils/RandomHex";
import IEmailService from "../services/interfaces/IEmailService";
import PaymentType from "../models/enums/PaymentType";
import ICachedRepository from "../infrastructure/interfaces/ICachedRepository";


jest.setTimeout(60000);

const EMAIL = 'l4kk3r@yandex.ru'
const PLAN_ID = 'ok_vpn_1_month'

const cachedRepository = container.get<ICachedRepository>(TYPES.CachedRepository);

describe('Mail service tests', () => {
    const mailService = container.get<IEmailService>(TYPES.EmailService);

    it('Send subscription notification', async () => {
        // Arrange
        const plan = cachedRepository.getPlanById(PLAN_ID)
        const subscription = new Subscription(0, null, plan, DateTime.utc(), DateTime.utc(), false, RandomHex())

        // Act
        await mailService.sendSubscription(EMAIL, subscription, PaymentType.New)

        // Assert
    })
})