import {DateTime} from "luxon";

export default class Payment {
    public id: number
    
    constructor(
        public readonly amount: number,
        public readonly user_id: number,
        public readonly entity_id: number,
        public readonly plan_id: string,
        public readonly type: string,
        public readonly status?: string,
        public readonly created_at?: DateTime,
        public readonly paid_at?: DateTime
    ) { }
}