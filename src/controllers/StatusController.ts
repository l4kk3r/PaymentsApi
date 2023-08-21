import {request, response, controller, Controller, httpGet} from "inversify-express-utils";
import GenerateLinkRequest from "../requests/GenerateLinkRequest";
import {NextFunction, Response} from "express";

@controller('/status')
export class StatusController implements Controller {
    @httpGet('')
    private generate(@request() request: GenerateLinkRequest, @response() response: Response) {
        response.status(200).send()
    }
}