import "reflect-metadata";
require('dotenv').config()

import { container} from "../src/di/inversify.config";
import {TYPES} from "../src/di/types";
import {DateTime, Duration} from "luxon";
import Subscription from "../src/models/Subscription";
import RandomHex from "../src/utils/RandomHex";
import IEmailService from "../src/services/interfaces/IEmailService";


jest.setTimeout(60000);

const EMAIL = 'l4kk3r@yandex.ru'
const PLAN_ID = 'ok_vpn_1_month'

describe('Mail service tests', () => {
    const mailService = container.get<IEmailService>(TYPES.EmailService);

    it('Send subscription notification', async () => {
        // Arrange
        const subscription = new Subscription(0, null, PLAN_ID, DateTime.utc(), DateTime.utc(), false, RandomHex())

        // Act
        await mailService.notifyAboutSubscription(EMAIL, subscription)

        // Assert
    })
})