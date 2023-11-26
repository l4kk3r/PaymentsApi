import ICachedRepository from "./interfaces/ICachedRepository";
import PlanV2 from "../models/PlanV2";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import {Pool} from "pg";
import {DateTime, Duration} from "luxon";

@injectable()
export default class CachedRepository implements ICachedRepository {
    private readonly MAX_LAST_QUERY = Duration.fromISO("PT3H")
    private lastPlansQueryAt: DateTime
    private cachedPlans: PlanV2[] = []

    constructor(@inject(TYPES.DatabasePool) protected _dbPool: Pool) {
        this.updatePlansIfNeeded()
    }

    getPlans(): PlanV2[] {
        this.updatePlansIfNeeded()
        return this.cachedPlans
    }

    getPlanById(id: string): PlanV2 {
        this.updatePlansIfNeeded()
        return this.cachedPlans.find(x => x.id === id)
    }

    private async updatePlansIfNeeded() {
        if (!this.lastPlansQueryAt || DateTime.utc().diff(this.lastPlansQueryAt) > this.MAX_LAST_QUERY) {
            const result = await this._dbPool.query('SELECT * FROM plans')
            this.cachedPlans = result.rows.map(x => new PlanV2(x.id, x.name, x.price, Duration.fromISO(x.duration), x.show))
            this.lastPlansQueryAt = DateTime.utc()
        }
    }

}