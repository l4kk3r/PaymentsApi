import Subscription from "../models/Subscription";

const KEY_HOST = process.env.KEYS_HOST

export default (subscription: Subscription) => {
    return `ssconf://${KEY_HOST}/key/${subscription.identifier}`
}

