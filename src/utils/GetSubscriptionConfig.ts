import Subscription from "../models/Subscription";

const API_HOST = process.env.API_HOST

export default (subscription: Subscription) => {
    return `ssconf://${API_HOST}/key/${subscription.identifier}`
}

