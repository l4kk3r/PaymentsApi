import IEmailService from "./interfaces/IEmailService";
import Subscription from "../models/Subscription";
import nodemailer, {Transporter} from 'nodemailer'
import GetSubscriptionConfig from "../utils/GetSubscriptionConfig";
import {injectable} from "inversify";
import PaymentType from "../models/enums/PaymentType";

@injectable()
export default class NodemailerService implements IEmailService {
    private messageText = {
        "new": "Спасибо за приобретение подписки на OKVpn! Активация нашего VPN займет всего пару минут\n\nИнструкция по активации: https://telegra.ph/Aktivaciya-OKVpn-08-07",
        "renew": "Спасибо за продление подписки на OKVpn!",
        "auto_renew": "Твоя подписка была автоматически продлена благодаря сохраненному способу оплаты!"
    }

    emailLogin: string
    transport: Transporter

    constructor() {
        this.emailLogin = process.env.EMAIL_LOGIN
        this.transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.EMAIL_PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_LOGIN,
                pass: process.env.EMAIL_PASSWORD
            }
        })

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
            from: `OKVpn - лучший VPN <${this.emailLogin}>`,
            to: email,
            subject: "Доступ к подписке OKVpn",
            text: `${this.messageText[paymentType]}\nТвой ключ доступа: ${GetSubscriptionConfig(subscription)}\n\nПриятного пользования! При возникновении любых проблем обращайся в поддержку и мы с радостью ответим.`
        }

        await this.transport.sendMail(message)
    }

    async notifyAboutFailedRenew(email: string, subscription: Subscription): Promise<void> {
        const message = {
            from: `OKVpn - лучший VPN <${this.emailLogin}>`,
            to: email,
            subject: "Не удалось продлить подписку на OKVpn",
            text: `Привет, нам не удалось автоматически продлить твою подписку на OKVpn. Поэтому твой доступ приостановлен :(\n\nКупить новую подписку можно всегда на нашем сайте https://okvpn.io или через телеграмм-бота https://t.me/okvpn_xbot.\n\nЖдем тебя снова!`
        }

        await this.transport.sendMail(message)
    }
}