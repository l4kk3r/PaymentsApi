import IEmailService from "./interfaces/IEmailService";
import Subscription from "../models/Subscription";
import nodemailer, {Transporter} from 'nodemailer'
import GetSubscriptionConfig from "../utils/GetSubscriptionConfig";
import {injectable} from "inversify";
import PaymentType from "../models/enums/PaymentType";

@injectable()
export default class NodemailerService implements IEmailService {
    private readonly serviceFullName: string
    private readonly guideUrl: string
    private readonly telegramBotUrl: string
    private readonly siteUrl: string
    private readonly emailLogin: string
    private readonly transport: Transporter
    private readonly messageText: {}

    constructor() {
        this.serviceFullName = process.env.SERVICE_FULLNAME
        this.emailLogin = process.env.EMAIL_LOGIN
        this.guideUrl = process.env.GUIDE_URL
        this.telegramBotUrl = process.env.TELEGRAM_BOT_URL
        this.siteUrl = process.env.SITE_URL
        this.transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_LOGIN,
                pass: process.env.EMAIL_PASSWORD
            }
        })

        this.messageText = {
            "new": `Спасибо за приобретение подписки на ${this.serviceFullName}! Активация нашего VPN займет всего пару минут\n\nИнструкция по активации: ${this.guideUrl}`,
            "renew": `Спасибо за продление подписки на ${this.serviceFullName}!`,
            "auto_renew": "Твоя подписка была автоматически продлена благодаря сохраненному способу оплаты!"
        }

        this.transport.verify(function (error, success) {
            if (error) {
                console.log(error);
            } else {
                console.log("SMTP server is ready");
            }
        });
    }

    async notifyAboutSubscription(email: string, subscription: Subscription, paymentType: PaymentType): Promise<void> {
        const message = {
            from: `${this.serviceFullName} - лучший VPN <${this.emailLogin}>`,
            to: email,
            subject: `Доступ к подписке ${this.serviceFullName}`,
            text: `${this.messageText[paymentType]}\nТвой ключ доступа: ${GetSubscriptionConfig(subscription)}\n\nПриятного пользования! При возникновении любых проблем обращайся в поддержку и мы с радостью ответим.`
        }

        await this.transport.sendMail(message)
    }

    async notifyAboutFailedRenew(email: string, subscription: Subscription): Promise<void> {
        const message = {
            from: `${this.serviceFullName} - лучший VPN <${this.emailLogin}>`,
            to: email,
            subject: `Не удалось продлить подписку на ${this.serviceFullName}`,
            text: `Привет, нам не удалось автоматически продлить твою подписку на ${this.serviceFullName}. Поэтому твой доступ приостановлен :(\n\nКупить новую подписку можно всегда на нашем сайте ${this.siteUrl} или через телеграмм-бота ${this.telegramBotUrl}.\n\nЖдем тебя снова!`
        }

        await this.transport.sendMail(message)
    }
}