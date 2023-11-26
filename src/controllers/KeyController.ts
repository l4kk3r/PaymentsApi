import {request, response, controller, httpPost, Controller, next, httpGet} from "inversify-express-utils";
import {NextFunction, Request, Response} from "express";
import {inject} from "inversify";
import {TYPES} from "../di/types";
import IConfigService from "../services/interfaces/IConfigService";
import GetKeyRequest from "../requests/GetKeyRequest";

@controller('/key')
export class KeyController implements Controller {
    @inject(TYPES.ConfigService) _configService: IConfigService;

    @httpGet('/:identifier')
    private async generate(
        @request() request: GetKeyRequest,
        @response() response: Response,
        @next() next: NextFunction)
    {
        const {identifier} = request.params
        const key = await this._configService.getKeyByIdentifier(identifier)

        response.send(key)
    }
}