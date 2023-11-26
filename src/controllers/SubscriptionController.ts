import {controller, httpGet, httpPost, request, response} from "inversify-express-utils";
import {Request, Response} from "express";
import {inject} from "inversify";
import {TYPES} from "../di/types";
import ISubscriptionService from "../services/interfaces/ISubscriptionService";
import CancelSubscriptionRequest from "../requests/CancelSubscriptionRequest";
import ConfirmSubscriptionCancellationRequest from "../requests/ConfirmSubscriptionCancellationRequest";

@controller('/subscription')
export default class Subscription {
    @inject(TYPES.SubscriptionService) _subscriptionService: ISubscriptionService

    @httpPost('/cancel')
    private async cancelSubscriptionByEmail(@request() request: CancelSubscriptionRequest, @response() response: Response) {
        await this._subscriptionService.requestSubscriptionCancellation(request.body.email)
        response.send()
    }

    @httpGet('/cancel-confirm/:key')
    private async confirmSubscriptionCancellation(@request() request: ConfirmSubscriptionCancellationRequest, @response() response: Response) {
        await this._subscriptionService.confirmSubscriptionCancellation(request.params.key)
        response.send('Подписка успешно отменена!')
    }
}