import {controller, httpGet, request, response} from "inversify-express-utils";
import {Request, Response} from "express";

@controller('/status')
export default class StatusController {
    @httpGet('')
    private satus(@request() request: Request, @response() response: Response) {
        response.status(200).send()
    }
}