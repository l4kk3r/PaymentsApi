import products from '../data/products.json'
import Plan from "../models/Plan";

export default (id: string): Plan => {
    const plan = products
        .reduce((a, b) => a.concat(b.plans), [] as Plan[])
        .find(x => x.id == id)

    return plan
}