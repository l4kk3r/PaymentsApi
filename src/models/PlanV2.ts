import {Duration} from "luxon";

export default class PlanV2 {
    constructor(
        public readonly id: string,
        public readonly name: string,
        public readonly price: number,
        public readonly duration: Duration,
        public readonly show: boolean
    ) { }
}