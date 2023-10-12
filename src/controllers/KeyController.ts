import {request, response, controller, httpPost, Controller, next, httpGet} from "inversify-express-utils";
import {Request, Response} from "express";
import {inject} from "inversify";
import {TYPES} from "../di/types";
import IKeyService from "../services/interfaces/IKeyService";

@controller('/key')
export class KeyController implements Controller {
    @inject(TYPES.IKeyService) _keyService: IKeyService;

    @httpGet('/:identifier')
    private async generate(@request() request: Request, @response() response: Response) {
        const {identifier} = request.params
        const key = await this._keyService.getKeyByIdentifier(identifier)

        response.setHeader('Content-Type', 'text/csv')
        response.send(key)
    }
}