import IRepository from "./interfaces/IRepository";
import Config from "../models/Config";
import {id, inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import {Pool, PoolClient, types} from "pg";
import Subscription from "../models/Subscription";
import {DateTime} from "luxon";
import User from "../models/User";
import Payment from "../models/Payment";
import PaymentDetails from "../models/PaymentDetails";
import PaymentType from "../models/enums/PaymentType";
import PaymentStatus from "../models/enums/PaymentStatus";
import AutoRenewStatus from "../models/enums/AutoRenewStatus";
import paymentStatus from "../models/enums/PaymentStatus";
import paymentType from "../models/enums/PaymentType";
import e from "express";
import CachedRepository from "./CachedRepository";

@injectable()
export default class Repository implements IRepository {
    DateTimeWithoutTimestampParser = 1114;

    @inject(TYPES.DatabasePool) protected _dbPool: Pool
    @inject(TYPES.CachedRepository) protected _cachedRepository: CachedRepository

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

    async createPayment(payment: Payment, client?: PoolClient | Pool): Promise<void> {
        client ??= this._dbPool

        const { amount, userId, entityId, plan, type, status, createdAt } = payment
        const result = await client.query(
            'INSERT INTO payments (amount, user_id, entity_id, plan_id, type, status, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [amount, userId, entityId, plan.id, type, status, createdAt]
        )

        payment.id = result.rows[0].id as number
    }

    async getUserByEmail(email: string): Promise<User> {
        const result = await this._dbPool.query(
            'SELECT * FROM users WHERE email=$1',
            [email]
        )
        const data = result.rows[0]

        return this.mapUser(data);
    }

    async getSubscriptionByIdentifier(identifier: string): Promise<Subscription> {
        const result = await this._dbPool.query(
            'SELECT * FROM subscriptions WHERE identifier=$1',
            [identifier]
        )
        const data = result.rows[0]

        return this.mapSubscription(data);
    }

    async getExpiredSubscriptions(allowedStatuses: string[]): Promise<Subscription[]> {
        const result = await this._dbPool.query(
            'SELECT * FROM subscriptions WHERE end_at < (current_timestamp at time zone \'utc\') AND auto_renew = ANY($1::text[])',
            [allowedStatuses]
        )

        return result.rows.map(data => this.mapSubscription(data))
    }

    async getSubscriptionConfig(subscriptionId: number, serverIp: string): Promise<Config> {
        const result = await this._dbPool.query(
            'SELECT * FROM configs WHERE configs.subscription_id=$1 AND server=$2',
            [subscriptionId, serverIp])
        const data = result.rows[0]

        return this.mapConfig(data);
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

        return this.mapConfig(data);
    }

    async deactivateConfig(id: number): Promise<void> {
        await this._dbPool.query(
            'UPDATE configs SET is_active=false WHERE id=$1',
            [id]
        )
    }

    async createSubscription(subscription: Subscription, client?: PoolClient | Pool): Promise<void> {
        client ??= this._dbPool
        const result = await client.query(
            'INSERT INTO subscriptions (user_id, plan_id, start_at, end_at, is_test, identifier, auto_renew) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id',
            [subscription.userId, subscription.plan.id, subscription.startAt.toSQL(), subscription.endAt.toSQL(), subscription.isTest, subscription.identifier, subscription.autoRenew]
        )
        subscription.id = Number(result.rows[0].id)
    }

    async getOldestActiveSubscriptionWithAutoRenewByUserId(userId: number): Promise<Subscription> {
        const result = await this._dbPool.query(
            'SELECT * FROM subscriptions WHERE user_id=$1 AND end_at > current_timestamp AND auto_renew=\'enabled\' ORDER BY end_at LIMIT 1',
            [userId]
        )
        const data = result.rows[0]

        return this.mapSubscription(data);
    }

    async setSubscriptionAutoRenewStatus(id: number, status: AutoRenewStatus): Promise<void> {
        await this._dbPool.query(
            'UPDATE subscriptions SET auto_renew=$1 WHERE id=$2',
            [status, id]
        )
    }

    async countActiveSubscriptionsWithAutoRenewByUserId(userId: number): Promise<number> {
        const result = await this._dbPool.query(
            'SELECT COUNT(*) FROM subscriptions WHERE user_id=$1 AND end_at > current_timestamp AND auto_renew=\'enabled\'',
            [userId]
        )

        return result.rows.length
    }


    async deleteNotificationsBySubscriptionId(subscriptionId: number, client?: PoolClient | Pool): Promise<void> {
        client ??= this._dbPool
        await client.query(
            'DELETE FROM notifications WHERE data->\'subscription_id\'=$1',
            [subscriptionId]
        )
    }

    async getPaymentById(id: number): Promise<Payment> {
        const result = await this._dbPool.query(
            'SELECT * FROM payments WHERE id=$1',
            [id]
        )
        const data = result.rows[0]

        return this.mapPayment(data)
    }

    async getSubscriptionById(id: number): Promise<Subscription> {
        const result = await this._dbPool.query(
            'SELECT * FROM subscriptions WHERE id=$1',
            [id]
        )
        const data = result.rows[0]

        return this.mapSubscription(data)
    }

    async getUserById(id: number): Promise<User> {
        const result = await this._dbPool.query(
            'SELECT * FROM users WHERE id=$1',
            [id]
        )
        const data = result.rows[0]

        return this.mapUser(data)
    }

    async updatePayment(payment: Payment, client?: PoolClient | Pool): Promise<void> {
        client ??= this._dbPool
        await client.query('UPDATE payments SET status=$1, paid_at=$2 WHERE id=$3',
            [payment.status, payment.paidAt, payment.id])
    }

    async getLastPaymentForSubscription(subscriptionId: number, paymentStatus: PaymentStatus, paymentType: PaymentType): Promise<Payment> {
        const result = await this._dbPool.query(
            'SELECT * FROM payments WHERE entity_id=$1 and status=$2 and type=$3 ORDER BY created_at DESC LIMIT 1',
            [subscriptionId, paymentStatus, paymentType]
        )
        const data = result.rows[0]

        return this.mapPayment(data)
    }

    async updateSubscription(subscription: Subscription, client?: PoolClient | Pool): Promise<void> {
        client ??= this._dbPool
        await client.query('UPDATE subscriptions SET end_at=$1, plan_id=$2, auto_renew=$3 WHERE id=$4',
            [subscription.endAt, subscription.plan.id, subscription.autoRenew, subscription.id])
    }

    async createPaymentDetails(paymentDetails: PaymentDetails, client?: PoolClient | Pool): Promise<void> {
        client ??= this._dbPool

        const { userId, billingProvider, paymentMethod, secret, createdAt } = paymentDetails
        const result = await client.query(
            'INSERT INTO payment_details (user_id, billing_provider, payment_method, secret, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING id',
            [userId, billingProvider, paymentMethod, secret, createdAt]
        )
        paymentDetails.id = result.rows[0].id as number
    }

    async getPaymentDetailsByUserId(userId: number): Promise<PaymentDetails> {
        const result = await this._dbPool.query(
            'SELECT * FROM payment_details WHERE user_id=$1 ORDER BY created_at DESC LIMIT 1',
            [userId]
        )
        const data = result.rows[0]

        return this.mapPaymentDetails(data)
    }

    private async existsPaymentDetailsBySecret(secret: string): Promise<boolean> {
        const result = await this._dbPool.query(
            'SELECT 1 FROM payment_details WHERE secret=$1',
            [secret]
        )

        return result.rowCount != 0;
    }

    async updatePaymentAndSubscription(payment: Payment, subscription: Subscription, paymentDetails?: PaymentDetails): Promise<void> {
        const client = await this._dbPool.connect()
        try {
            await client.query('BEGIN')

            if (!subscription.id)
                await this.createSubscription(subscription, client)
            else {
                await this.updateSubscription(subscription, client)
                await this.deleteNotificationsBySubscriptionId(subscription.id, client)
            }

            if (paymentDetails != null && !(await this.existsPaymentDetailsBySecret(paymentDetails.secret))) {
                await this.createPaymentDetails(paymentDetails, client)
            }

            if (!payment.id)
                await this.createPayment(payment, client)
            else
                await this.updatePayment(payment, client)

            await client.query('COMMIT')
        } catch (e) {
            await client.query('ROLLBACK')
            throw e
        } finally {
            client.release()
        }
    }

    private mapSubscription(data: any) : Subscription {
        if (!data) return null;

        const plan = this._cachedRepository.getPlanById(data.plan_id)
        return new Subscription(
            data.id,
            data.user_id,
            plan,
            data.start_at,
            data.end_at,
            data.is_test,
            data.identifier,
            data.auto_renew as AutoRenewStatus);
    }

    private mapUser(data: any) : User {
        if (!data) return null;

        return new User(
            data.id,
            data.telegram_id,
            data.username,
            data.source,
            data.email,
            data.ref_id);
    }

    private mapConfig(data: any) : Config {
        if (!data) return null;

        return new Config(
            data.id,
            data.data,
            data.server,
            data.key_id,
            data.is_active,
            data.subscription_id)
    }

    private mapPayment(data: any) : Payment {
        if (!data) return null;

        const plan = this._cachedRepository.getPlanById(data.plan_id)
        return new Payment(
            data.id,
            data.amount,
            data.user_id,
            data.entity_id,
            plan,
            data.type as PaymentType,
            data.status as PaymentStatus,
            data.created_at,
            data.paid_at
        )
    }

    private mapPaymentDetails(data: any) : PaymentDetails {
        if (!data) return null;

        return new PaymentDetails(
            data.id,
            data.user_id,
            data.billing_provider,
            data.payment_method,
            data.secret)
    }
}