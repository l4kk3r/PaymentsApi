import {NextFunction, Response} from 'express';
import GeneratePaymentRequest from "../requests/GeneratePaymentRequest";
import {TYPES} from "../di/types";
import {request, response, controller, httpPost, Controller, next} from "inversify-express-utils";
import {inject} from "inversify";
import GenerateLinkParameters from "../services/parameters/GenerateLinkParameters";
import bodyValidatorMiddleware from "../middlewares/BodyValidatorMiddleware";
import GenerateLinkRequestBodyValidator from "../requests/validators/GenerateLinkRequestBodyValidator";
import IPaymentService from "../services/interfaces/IPaymentService";
import GeneratePaymentFromEmailRequest from "../requests/GeneratePaymentFromEmailRequest";
import GenerateLinkFromEmailRequestBodyValidator from "../requests/validators/GenerateLinkFromEmailRequestBodyValidator";
import GenerateLinkFromEmailParameters from "../services/parameters/GenerateLinkFromEmailParameters";

@controller('/payment')
export class PaymentController implements Controller {
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService

    @httpPost('/generate', bodyValidatorMiddleware(GenerateLinkRequestBodyValidator))
    private async generate(
        @request() request: GeneratePaymentRequest,
        @response() response: Response,
        @next() next: NextFunction)
    {
        const { userId, planId, paymentMethod, subscriptionId, returnUrl } = request.body

        const parameters = { userId, planId, paymentMethod, subscriptionId, returnUrl }
        const result = await this._paymentService.generatePayment(parameters)

        response.json(result)
    }

    @httpPost('/generate-from-email', bodyValidatorMiddleware(GenerateLinkFromEmailRequestBodyValidator))
    private async generateFromEmail(
        @request() request: GeneratePaymentFromEmailRequest,
        @response() response: Response,
        @next() next: NextFunction)
    {
        const { planId, paymentMethod, email, returnUrl} = request.body

        const parameters = { planId, paymentMethod, email, returnUrl }
        const link = await this._paymentService.generatePaymentFromEmail(parameters)

        response.json({ link })
    }
}