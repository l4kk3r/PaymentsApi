import IRepository from "./interfaces/IRepository";
import Config from "../models/Config";
import {id, inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import {Pool, types} from "pg";
import Subscription from "../models/Subscription";
import {DateTime} from "luxon";
import User from "../models/User";
import Payment from "../models/Payment";
import {type} from "os";
import {config} from "dotenv";

@injectable()
export default class Repository implements IRepository {
    DateTimeWithoutTimestampParser = 1114;

    @inject(TYPES.DatabasePool) protected _dbPool: Pool

    constructor() {
        types.setTypeParser(this.DateTimeWithoutTimestampParser, function (stringValue) {
            return DateTime.fromSQL(stringValue, {zone: 'utc'});
        })
    }

    async createUser(user: User): Promise<void> {
        const { telegramId, username, source, email, refId } = user

        const result = await this._dbPool.query(
            'INSERT INTO users (telegram_id, username, source, email, ref_id) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [telegramId, username, source, email, refId]
        )
        user.id = result.rows[0].id as number
    }

    async createPayment(payment: Payment): Promise<void> {
        const { amount, userId, entityId, planId, type } = payment

        const result = await this._dbPool.query(
            'INSERT INTO payments (amount, user_id, entity_id, plan_id, type) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [amount, userId, entityId, planId, type]
        )
        payment.id = result.rows[0].id as number
    }

    async getUserByEmail(email: string): Promise<User> {
        const result = await this._dbPool.query(
            'SELECT * FROM users WHERE email=$1',
            [email]
        )

        const data = result.rows[0]
        if (!data) return null;

        return new User(data.id, data.telegram_id, data.username, data.source, data.email, data.ref_id);
    }

    async getSubscriptionByIdentifier(identifier: string): Promise<Subscription> {
        const result = await this._dbPool.query(
            'SELECT * FROM subscriptions WHERE identifier=$1',
            [identifier]
        )
        const data = result.rows[0]
        if (!data) return null;

        return new Subscription(data.id, data.user_id, data.plan_id, data.start_at, data.end_at, data.is_test, data.identifier);
    }

    async getSubscriptionConfig(subscriptionId: number, serverIp: string): Promise<Config> {
        const result = await this._dbPool.query(
            'SELECT * FROM configs WHERE configs.subscription_id=$1 AND server=$2',
            [subscriptionId, serverIp])

        const data = result.rows[0]
        if (!data) return null;

        return new Config(data.id, data.data, data.server, data.key_id, data.is_active, data.subscription_id);
    }

    async createConfig(config: Config): Promise<void> {
        const { data, keyId, server , subscriptionId} = config

        const result = await this._dbPool.query(
            'INSERT INTO configs (data, key_id, server, subscription_id) VALUES ($1, $2, $3, $4) RETURNING id',
            [data, keyId, server, subscriptionId]
        )
        config.id = result.rows[0].id as number
    }

    async getConfig(id: number): Promise<Config> {
        const result = await this._dbPool.query(
            'SELECT * FROM configs WHERE id=$1',
            [id]
        )

        const data = result.rows[0]
        if (!data) return null;

        return new Config(data.id, data.data, data.server, data.key_id, data.is_active, data.subscription_id);
    }

    async deactivateConfig(id: number): Promise<void> {
        await this._dbPool.query(
            'UPDATE configs SET is_active=false WHERE id=$1',
            [id]
        )
    }

    async createSubscription(subscription: Subscription): Promise<void> {
        const result = await this._dbPool.query(
            'INSERT INTO subscriptions (user_id, plan_id, start_at, end_at, is_test, identifier) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
            [subscription.userId, subscription.planId, subscription.startAt.toSQL(), subscription.endAt.toSQL(), subscription.isTest, subscription.identifier]
        )
        subscription.id = Number(result.rows[0].id)
    }

    async emptyNotificationsBySubscriptionId(subscriptionId: number): Promise<void> {
        await this._dbPool.query(
            'UPDATE notifications SET data=jsonb_set(data, \'{last_notification_id}\', \'null\') WHERE data->\'subscription_id\'=$1',
            [subscriptionId]
        )
    }

    async getPaymentById(id: number): Promise<Payment> {
        const result = await this._dbPool.query(
            'SELECT * FROM payments WHERE id=$1',
            [id]
        )
        const data = result.rows[0]

        return data ? new Payment(
            data.id,
            data.amount,
            data.user_id,
            data.entity_id,
            data.plan_id,
            data.type,
            data.static,
            data.created_at,
            data.paid_at
        ) : null
    }

    async getSubscriptionById(id: number): Promise<Subscription> {
        const result = await this._dbPool.query(
            'SELECT * FROM subscriptions WHERE id=$1',
            [id]
        )
        const data = result.rows[0]

        return data ? new Subscription(
            data.id,
            data.user_id,
            data.plan_id,
            data.start_at,
            data.end_at,
            data.is_test,
            data.identifier
        ) : null
    }

    async getUserById(id: number): Promise<User> {
        const result = await this._dbPool.query(
            'SELECT * FROM users WHERE id=$1',
            [id]
        )
        const data = result.rows[0]

        return data ? new User(
            data.id,
            data.telegram_id,
            data.username,
            data.source,
            data.email,
            data.ref_id
        ) : null
    }

    async updatePayment(payment: Payment): Promise<void> {
        await this._dbPool.query('UPDATE payments SET status=$1, paid_at=$2 WHERE id=$3',
            [payment.status, payment.paidAt, payment.id])
    }

    async updateSubscription(subscription: Subscription): Promise<void> {
        await this._dbPool.query('UPDATE subscriptions SET end_at=$1, plan_id=$2 WHERE id=$3',
            [subscription.endAt, subscription.planId, subscription.id])
    }
}