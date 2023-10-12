import {DateTime} from "luxon";

export default class Subscription {
    constructor (
        public readonly id: number,
        public readonly userId: number,
        public readonly planId: string,
        public readonly configId: number,
        public readonly startAt: DateTime,
        public readonly endAt: DateTime,
        public readonly isTest: boolean,
        public readonly identifier: string) { }

    public isExpired() {
        return DateTime.utc() > this.endAt;
    }
}