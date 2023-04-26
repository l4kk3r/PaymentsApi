import {NextFunction, Response} from 'express';
import GenerateLinkRequest from "../requests/GenerateLinkRequest";
import LinkService from "../services/LinkService";
import {TYPES} from "../di/types";
import {request, response, controller, httpPost, Controller, next} from "inversify-express-utils";
import {inject} from "inversify";
import GenerateLinkParameters from "../services/parameters/GenerateLinkParameters";
import bodyValidatorMiddleware from "../middlewares/BodyValidatorMiddleware";
import GenerateLinkRequestBodyValidator from "../validators/GenerateLinkRequestBodyValidator";

@controller('/link')
export class LinkController implements Controller {
    @inject(TYPES.LinkService) private _linkService: LinkService

    @httpPost('/generate', bodyValidatorMiddleware(GenerateLinkRequestBodyValidator))
    private generate(@request() request: GenerateLinkRequest, @response() response: Response, @next() next: NextFunction) {
        const { service, paymentMethod, currency, amount, payload} = request.body
        const generateParameters = { service, paymentMethod, currency, amount, payload} as GenerateLinkParameters

        const link = this._linkService.generate(generateParameters)

        response.json({ link })
    }
}