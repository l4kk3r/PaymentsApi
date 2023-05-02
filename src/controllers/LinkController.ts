import {NextFunction, Response} from 'express';
import GenerateLinkRequest from "../requests/GenerateLinkRequest";
import {TYPES} from "../di/types";
import {request, response, controller, httpPost, Controller, next} from "inversify-express-utils";
import {inject} from "inversify";
import GenerateLinkParameters from "../services/parameters/GenerateLinkParameters";
import bodyValidatorMiddleware from "../middlewares/BodyValidatorMiddleware";
import GenerateLinkRequestBodyValidator from "../validators/GenerateLinkRequestBodyValidator";
import ILinkService from "../services/interfaces/ILinkService";

@controller('/link')
export class LinkController implements Controller {
    @inject(TYPES.ILinkService) private _linkService: ILinkService

    @httpPost('/generate', bodyValidatorMiddleware(GenerateLinkRequestBodyValidator))
    private async generate(@request() request: GenerateLinkRequest, @response() response: Response, @next() next: NextFunction) {
        const {service, paymentMethod, amount, currency, payload} = request.body
        const generateParameters = {service, paymentMethod, amount, currency, payload} as GenerateLinkParameters

        const link = await this._linkService.generate(generateParameters)

        response.json({ link })
    }
}