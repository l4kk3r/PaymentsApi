import IPaymentRepository from "./interfaces/IPaymentRepository";
import Payment from "../models/Payment";
import amqp, {Channel} from "amqplib";
import {injectable} from "inversify";

@injectable()
export default class PaymentRepository implements IPaymentRepository {
    private channel: Channel

    constructor() {
        const url = process.env.RABBITMQ_URL

        this.createChannel(url)
            .then(channel => this.channel = channel)
    }

    notify(service: string, payment: Payment): void {
        const queue = `${service}_payments`
        const messageBuffer = Buffer.from(JSON.stringify(payment))

        this.channel.sendToQueue(queue, messageBuffer)
    }

    private async createChannel(url: string): Promise<Channel> {
        const connection = await amqp.connect(url)
        const channel = await connection.createChannel()

        const services = JSON.parse(process.env.SERVICES)

        const asserts = services.map(service =>
            channel.assertQueue(`${service}_payments`, { durable: true }))
        await Promise.all(asserts)

        return channel
    }
}