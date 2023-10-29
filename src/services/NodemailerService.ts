import IEmailService from "./interfaces/IEmailService";
import User from "../models/User";
import Subscription from "../models/Subscription";
import nodemailer, {Transporter} from 'nodemailer'
import GetSubscriptionConfig from "../utils/GetSubscriptionConfig";
import {injectable} from "inversify";

@injectable()
export default class NodemailerService implements IEmailService {
    emailLogin: string
    transport: Transporter

    constructor() {
        this.emailLogin = process.env.EMAIL_LOGIN
        this.transport = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: Number(process.env.PORT),
            secure: true,
            auth: {
                user: process.env.EMAIL_LOGIN,
                pass: process.env.EMAIL_PASSWORD
            }
        })
    }

    async notifyAboutSubscription(user: User, subscription: Subscription): Promise<void> {
        const message = {
            from: `OKVpn - лучший VPN <${this.emailLogin}>`,
            to: user.email,
            subject: "Доступ к подписке OKVpn",
            text: `Спасибо за приобретение подписки на OKVpn! Активация нашего VPN займет всего пару минут.\n\nИнструкция по активации: \nВаш ключ доступа: ${GetSubscriptionConfig(subscription)}\n\nПриятного пользования! При возникновении любых проблем пишите в поддержку и мы с радостью ответим.`
        }

        await this.transport.sendMail(message)
    }
}