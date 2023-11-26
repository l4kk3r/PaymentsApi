import IMessageBroker from "./interfaces/IMessageBroker";
import PaymentMessage from "../models/messages/PaymentMessage";
import amqp, {Channel} from "amqplib";
import {inject, injectable} from "inversify";
import FailedSubscriptionAutoRenewMessage from "../models/messages/FailedSubscriptionAutoRenewMessage";
import BaseMessage from "../models/messages/BaseMessage";
import ILogger from "./interfaces/ILogger";
import {TYPES} from "../di/types";
import ILoggerFactory from "./interfaces/ILoggerFactory";

@injectable()
export default class MessageBroker implements IMessageBroker {
    private Exchanges = {
        'payments': 'payments',
        'failedAutoRenews': 'failed_auto_renews'
    }
    private ExchangeType = 'direct'
    private ServiceName = process.env.SERVICE_NAME

    private channel: Channel
    private readonly _logger: ILogger

    constructor(@inject(TYPES.LoggerFactory) loggerFactory: ILoggerFactory) {
        this._logger = loggerFactory.create("message-broker")
        const url = process.env.RABBITMQ_URL

        this.createChannel(url)
            .then(channel => {
                this._logger.info("RabbitMQ connected")
                this.channel = channel
            })
    }

    private async createChannel(url: string): Promise<Channel> {
        const connection = await amqp.connect(url)
        const channel = await connection.createChannel()

        for (let exchange of Object.values(this.Exchanges)) {
            const dlqExchangeName = `${exchange}_dlq`
            await channel.assertExchange(exchange, this.ExchangeType)
            await channel.assertExchange(dlqExchangeName, this.ExchangeType)

            const queueName = `${this.ServiceName}_${exchange}`
            const dlqQueueName = `${queueName}_dlq`

            await channel.assertQueue(queueName, { durable: true, deadLetterExchange: dlqExchangeName })
            await channel.assertQueue(dlqQueueName, { durable: true, autoDelete: false })
            await channel.bindQueue(queueName, exchange, this.ServiceName)
            await channel.bindQueue(dlqQueueName, dlqExchangeName, this.ServiceName)
        }

        return channel
    }

    notify(message: BaseMessage): void {
        let exchange: string
        if (message instanceof PaymentMessage) {
            exchange = this.Exchanges.payments
        } else if (message instanceof FailedSubscriptionAutoRenewMessage) {
            exchange = this.Exchanges.failedAutoRenews
        } else {
            throw new Error('Queue for this message does not exist')
        }

        const messageBuffer = Buffer.from(JSON.stringify(message))
        this.channel.publish(exchange, this.ServiceName, messageBuffer)
    }

    async getPaymentMessage(ack: boolean): Promise<PaymentMessage> {
        const message = await this.getMessage(`${this.ServiceName}_${this.Exchanges.payments}`, ack)
        return message ? new PaymentMessage(message.subscriptionId, message.type) : null
    }

    async getFailedAutoRenewMessage(ack: boolean): Promise<FailedSubscriptionAutoRenewMessage> {
        const message = await this.getMessage(`${this.ServiceName}_${this.Exchanges.failedAutoRenews}`, ack)
        return message ? new FailedSubscriptionAutoRenewMessage(message.subscriptionId) : null
    }

    private async getMessage(queue: string, ack: boolean) {
        const message = await this.channel.get(queue)
        if (!message)
            return

        const content = JSON.parse(message.content.toString())
        if (ack)
            this.channel.ack(message)
        else
            this.channel.nack(message)

        return content
    }

    purgeAll() {
        for (let exchange of Object.values(this.Exchanges)) {
            const queueName = `${this.ServiceName}_${exchange}`
            this.channel.purgeQueue(queueName)
        }
    }
}