import IMessageBroker from "./interfaces/IMessageBroker";
import PaymentMessage from "../models/PaymentMessage";
import amqp, {Channel} from "amqplib";
import {injectable} from "inversify";

@injectable()
export default class MessageBroker implements IMessageBroker {
    private ExchangeName = 'payments'
    private ExchangeType = 'direct'
    private ServiceName = process.env.SERVICE_NAME

    private channel: Channel

    constructor() {
        const url = process.env.RABBITMQ_URL

        this.createChannel(url)
            .then(channel => {
                console.log("RabbitMQ connected")
                this.channel = channel
            })
    }

    notify(payment: PaymentMessage): void {
        const messageBuffer = Buffer.from(JSON.stringify(payment))
        this.channel.publish(this.ExchangeName, this.ServiceName, messageBuffer)
    }

    private async createChannel(url: string): Promise<Channel> {
        const connection = await amqp.connect(url)
        const channel = await connection.createChannel()

        const dlqExchangeName = `${this.ExchangeName}_dlq`
        await channel.assertExchange(this.ExchangeName, this.ExchangeType)
        await channel.assertExchange(dlqExchangeName, this.ExchangeType)

        const queueName = `${this.ServiceName}_payments`
        const dlqQueueName = `${queueName}_dlq`

        await channel.assertQueue(queueName, { durable: true, deadLetterExchange: dlqExchangeName })
        await channel.assertQueue(dlqQueueName, { durable: true, autoDelete: false })
        await channel.bindQueue(queueName, this.ExchangeName, this.ServiceName)
        await channel.bindQueue(dlqQueueName, dlqExchangeName, this.ServiceName)

        return channel
    }

    async getLatestMessage(noAck: boolean): Promise<PaymentMessage> {
        const message = await this.channel.get(`${this.ServiceName}_payments`, { noAck })
        if (!message)
            return

        const content = JSON.parse(message.content.toString())
        this.channel.ack(message)

        return new PaymentMessage(content.subscriptionId, content.type)
    }
}