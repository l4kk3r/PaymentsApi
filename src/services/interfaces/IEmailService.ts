import User from "../../models/User";
import Subscription from "../../models/Subscription";

export default interface IEmailService {
    notifyAboutSubscription(email: string, subscription: Subscription): Promise<void>
}