import {DateTime} from "luxon";

export default class Payment {
    constructor(
        public id: number,
        public readonly amount: number,
        public readonly userId: number,
        public readonly entityId: number,
        public readonly planId: string,
        public readonly type: string,
        public status: string = 'created',
        public readonly createdAt?: DateTime,
        public paidAt?: DateTime
    ) { }
}