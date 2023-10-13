import {request, response, controller, httpPost, Controller, next, httpGet} from "inversify-express-utils";
import {Request, Response} from "express";
import {inject} from "inversify";
import {TYPES} from "../di/types";
import IConfigService from "../services/interfaces/IConfigService";

@controller('/key')
export class KeyController implements Controller {
    @inject(TYPES.IConfigService) _configService: IConfigService;

    @httpGet('/:identifier')
    private async generate(@request() request: Request, @response() response: Response) {
        const {identifier} = request.params
        const key = await this._configService.getKeyByIdentifier(identifier)

        response.send(key)
    }
}