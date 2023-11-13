import {DateTime} from "luxon";
import AutoRenewStatus from "./enums/AutoRenewStatus";

export default class Subscription {
    constructor (
        public id: number,
        public readonly userId: number,
        public planId: string,
        public readonly startAt: DateTime,
        public endAt: DateTime,
        public readonly isTest: boolean,
        public readonly identifier: string,
        public autoRenew: AutoRenewStatus = AutoRenewStatus.Disabled) { }

    public isExpired() {
        return DateTime.utc() > this.endAt;
    }

    public setAutoRenewStatus(status: AutoRenewStatus) {
        this.autoRenew = status;
    }
}