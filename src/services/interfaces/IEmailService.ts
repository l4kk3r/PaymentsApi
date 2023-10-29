import User from "../../models/User";
import Subscription from "../../models/Subscription";

export default interface IEmailService {
    notifyAboutSubscription(user: User, subscription: Subscription): Promise<void>
}