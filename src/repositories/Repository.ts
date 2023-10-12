import IRepository from "./interfaces/IRepository";
import Config from "../models/Config";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import {Pool, types} from "pg";
import Subscription from "../models/Subscription";
import {DateTime} from "luxon";

@injectable()
export default class Repository implements IRepository {
    DateTimeWithoutTimestampParser = 1114;

    @inject(TYPES.DatabasePool) protected _dbPool: Pool

    constructor() {
        types.setTypeParser(this.DateTimeWithoutTimestampParser, function(stringValue) {
            return DateTime.fromSQL(stringValue, { zone: 'utc' });
        })
    }

    async getSubscriptionByIdentifier(identifier: string): Promise<Subscription> {
        const result = await this._dbPool.query(
            'SELECT * FROM subscriptions WHERE identifier=$1',
            [identifier]
        )
        const data = result.rows[0]
        if (!data) return null;

        return new Subscription(data.id, data.user_id, data.plan_id, data.config_id, data.start_at, data.end_at, data.is_test, data.identifier);
    }

    async getSubscriptionConfigs(subscriptionId: number): Promise<Config[]> {
        const result = await this._dbPool.query(
            'SELECT * FROM configs WHERE configs.subscription_id=$1',
            [subscriptionId])

        const configs: Config[] = []
        for (let config of result.rows) {
            configs.push(new Config(config.id, config.data, config.server, config.key_id, config.is_active, config.subscription_id))
        }

        return configs
    }
}