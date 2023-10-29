import Subscription from "../models/Subscription";

export default (subscription: Subscription) => {
    return `ssconf://api.okvpn.io/key/${subscription.identifier}`
}

