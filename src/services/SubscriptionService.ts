import ISubscriptionService from "./interfaces/ISubscriptionService";
import Subscription from "../models/Subscription";
import {DateTime, Duration} from "luxon";
import RandomHex from "../utils/RandomHex";
import Plan from "../models/Plan";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import IRepository from "../infrastructure/interfaces/IRepository";

@injectable()
export default class SubscriptionService implements ISubscriptionService {
    private RENEWAL_BONUS = "P7D"

    @inject(TYPES.Repository) private _repository: IRepository

    async createSubscription(userId: number, plan: Plan): Promise<Subscription> {
        const startDate = DateTime.utc()
        const endDate = startDate.plus(Duration.fromISO(plan.duration))
        const identifier = RandomHex()

        return new Subscription(null, userId, plan.id, startDate, endDate, false, identifier)
    }

    async renewSubscription(subscriptionId: number, plan: Plan): Promise<Subscription> {
        const subscription = await this._repository.getSubscriptionById(subscriptionId)

        const endDate = subscription.endAt > DateTime.utc() ? subscription.endAt : DateTime.utc()
        const duration = Duration.fromISO(plan.duration).plus(Duration.fromISO(this.RENEWAL_BONUS))
        subscription.planId = plan.id
        subscription.endAt = endDate.plus(duration)

        return subscription
    }

}