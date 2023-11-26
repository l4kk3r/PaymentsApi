import PlanV2 from "../../models/PlanV2";

export default interface ICachedRepository {
    getPlanById(id: string): PlanV2

    getPlans(): PlanV2[]
}