import IEmailService from "./interfaces/IEmailService";
import Subscription from "../models/Subscription";
import nodemailer, {Transporter} from 'nodemailer'
import GetSubscriptionConfig from "../utils/GetSubscriptionConfig";
import {inject, injectable} from "inversify";
import PaymentType from "../models/enums/PaymentType";
import ILogger from "../infrastructure/interfaces/ILogger";
import {TYPES} from "../di/types";
import ILoggerFactory from "../infrastructure/interfaces/ILoggerFactory";

@injectable()
export default class NodemailerService implements IEmailService {
    private readonly serviceFullName: string
    private readonly guideUrl: string
    private readonly telegramBotUrl: string
    private readonly siteUrl: string
    private readonly emailLogin: string
    private readonly transport: Transporter
    private readonly messageSubject: {}
    private readonly messageText: {}
    private readonly messageHeader: string
    private readonly emailMainColor: string
    private readonly emailLogo: string
    private readonly _logger: ILogger

    constructor(@inject(TYPES.LoggerFactory) loggerFactory: ILoggerFactory) {
        this.serviceFullName = process.env.SERVICE_FULLNAME
        this.emailLogin = process.env.EMAIL_LOGIN
        this.guideUrl = process.env.GUIDE_URL
        this.telegramBotUrl = process.env.TELEGRAM_BOT_URL
        this.siteUrl = process.env.SITE_URL
        this.emailMainColor = process.env.EMAIL_MAIN_COLOR
        this.emailLogo = process.env.EMAIL_LOGO
        this.transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_LOGIN,
                pass: process.env.EMAIL_PASSWORD
            }
        })
        this._logger = loggerFactory.create("email-service")

        this.messageHeader = `${this.serviceFullName} - Лучший VPN <${this.emailLogin}>`
        this.messageSubject = {
            "new": 'Успешная покупка подписки',
            "renew": 'Успешное продление подписки',
            "auto_renew": 'Автоматическое продление подписки'
        }
        this.messageText = {
            "new": `Поздравляем с приобретением подписки!\nАктивация нашего VPN займет всего пару минут\n\nИнструкция по активации: ${this.guideUrl}`,
            "renew": `Поздравляем с продлением подписки!`,
            "auto_renew": 'Твоя подписка была автоматически продлена благодаря сохраненному способу оплаты!'
        }

        this.transport.verify((error, success) => {
            if (error) {
                this._logger.error(error.message);
            } else {
                this._logger.error("SMTP server is ready");
            }
        });
    }

    async sendSubscription(email: string, subscription: Subscription, paymentType: PaymentType): Promise<void> {
        const text = `${this.messageText[paymentType]}\nТвой ключ доступа: ${GetSubscriptionConfig(subscription)}\n\nПриятного пользования! При возникновении любых проблем обращайся в поддержку и мы с радостью ответим`

        const message = {
            from: this.messageHeader,
            to: email,
            subject: this.messageSubject[paymentType],
            text,
            html: this.generateHtml(text)
        }

        this.transport.sendMail(message).catch(err => {
            this._logger.error(err.message)
        })
    }

    async sendFailedRenew(email: string, subscription: Subscription): Promise<void> {
        const text = `Нам не удалось автоматически продлить твою подписку. Поэтому твой доступ приостановлен\n\nКупить новую подписку можно всегда на нашем сайте или в телеграмм-боте\n\nБудем ждать тебя в безопасном интернете без ограничений!`

        const message = {
            from: this.messageHeader,
            to: email,
            subject: 'Не удалось продлить подписку',
            text: text,
            html: this.generateHtml(text)
        }

        this.transport.sendMail(message).catch(err => {
            this._logger.error(err.message)
        })
    }

    async sendSubscriptionCancellationRequest(email: string, cancellationLink: string): Promise<void> {
        const text = `Ты запросил отмену автоматического продления на наш сервис\nПросим дать нам второй шанс, мы готовы предложить лучшие условия. Просто напиши нам в поддержку\n\nЕсли твое решение окончательное - перейди по ссылке для подтверждения отмены <a href="${cancellationLink}">${cancellationLink}</a>`

        const message = {
            from: this.messageHeader,
            to: email,
            subject: `Запрос на отмену автопродления подписки`,
            text,
            html: this.generateHtml(text)
        }

        this.transport.sendMail(message).catch(err => {
            this._logger.error(err.message)
        })
    }

    async sendSubscriptionCancellationConfirmation(email: string, subscriptionsLeftCount: number): Promise<void> {
        const text = `Автопродление успешно отменено\n${subscriptionsLeftCount ? 'Осталось твоих подписок с автопродлением: ' + subscriptionsLeftCount : 'У тебя не осталось подписок с автопродлением\n\nБудем ждать тебя в безопасном интернете без ограничений!'}`

        const message = {
            from: this.messageHeader,
            to: email,
            subject: `Автопродление успешно отменено`,
            text,
            html: this.generateHtml(text)
        }

        this.transport.sendMail(message).catch(err => {
            this._logger.error(err.message)
        })
    }

    private generateHtml(text: string) {
        const formattedText = text.replace(/\n/g, '<br />')

        return `<div style="padding: 10px;">
                    <img src="${this.emailLogo}" alt="logo" width="180"/>
                    <h3 style="font-weight: 500;margin-bottom: 50px;">${formattedText}</h3>
                    <a href="${this.siteUrl}" target="_blank" style="background: ${this.emailMainColor};padding: 10px 0;display: block;margin-bottom: 20px;border-radius: 10px;text-align: center;font-weight: 500;color: #fff;border: none;text-decoration: none;outline: none">Перейти на сайт</a>
                    <a href="${this.telegramBotUrl}" target="_blank" style="background: ${this.emailMainColor};padding: 10px 0;display: block;border-radius: 10px;text-align: center;font-weight: 500;color: #fff;border: none;text-decoration: none;outline: none">Перейти в телеграм бота</a>
                </div>`
    }
}