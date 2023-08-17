import IPaymentRepository from "./interfaces/IPaymentRepository";
import Payment from "../models/Payment";
import amqp, {Channel} from "amqplib";
import {injectable} from "inversify";
import {Console} from "inspector";

@injectable()
export default class PaymentRepository implements IPaymentRepository {
    private ExchangeName = 'payments'
    private ExchangeType = 'direct'

    private channel: Channel

    constructor() {
        const url = process.env.RABBITMQ_URL

        this.createChannel(url)
            .then(channel => {
                console.log("RabbitMQ connected")
                this.channel = channel
            })
    }

    notify(service: string, payment: Payment): void {
        const messageBuffer = Buffer.from(JSON.stringify(payment))
        this.channel.publish(this.ExchangeName, service, messageBuffer)
    }

    private async createChannel(url: string): Promise<Channel> {
        const connection = await amqp.connect(url)
        const channel = await connection.createChannel()

        const services = JSON.parse(process.env.SERVICES)

        const dlqExchangeName = `${this.ExchangeName}_dlq`
        await channel.assertExchange(this.ExchangeName, this.ExchangeType)
        await channel.assertExchange(dlqExchangeName, this.ExchangeType)

        for (let service of services) {
            const queueName = `${service}_payments`
            const dlqQueueName = `${queueName}_dlq`

            await channel.assertQueue(queueName, { durable: true, deadLetterExchange: dlqExchangeName })
            await channel.assertQueue(dlqQueueName, { durable: true, autoDelete: false })
            await channel.bindQueue(queueName, this.ExchangeName, service)
            await channel.bindQueue(dlqQueueName, dlqExchangeName, service)
        }

        return channel
    }
}