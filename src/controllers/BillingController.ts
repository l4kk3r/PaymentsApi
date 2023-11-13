import {request, response, next, Controller, controller, httpPost} from "inversify-express-utils";
import {inject} from "inversify";
import {TYPES} from "../di/types";
import {Response} from "express";
import ConfirmYookassaPaymentRequest from "../requests/ConfirmYookassaPaymentRequest";
import IPaymentService from "../services/interfaces/IPaymentService";
import ILogger from "../infrastructure/interfaces/ILogger";
import ILoggerFactory from "../infrastructure/interfaces/ILoggerFactory";

@controller('/billing')
export class BillingController implements Controller {
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService
    private readonly _logger: ILogger

    constructor(@inject(TYPES.LoggerFactory) loggerFactory: ILoggerFactory) {
        this._logger = loggerFactory.create("renew-job")
    }

    @httpPost('/confirm/yookassa')
    private async confirmYookassa(
        @request() request: ConfirmYookassaPaymentRequest,
        @response() response: Response,
        @next() next)
    {
        const data = request.body.object
        if (request.body.event != 'payment.succeeded' || !data.metadata || Object.keys(data.metadata).length == 0)
            return response.send()

        this._logger.info('Received payment request')

        try {
            const confirmPaymentParameters = {
                uuid: data.id,
                amount: data.amount.value,
                paymentId: Number(data.metadata.paymentId),
                currency: data.amount.currency,
                paymentDetails: {
                    billingProvider: 'yookassa',
                    paymentMethod: data.payment_method?.type,
                    secret: data.payment_method?.id,
                    isSaved: data.payment_method?.saved
                }
            }

            // TODO: verify payment based on ip
            await this._paymentService.confirmPayment(confirmPaymentParameters)

            this._logger.info(`Payment request #${data.id} is verified`)

            response.send()
        } catch (e) {
            this._logger.error(`Payment request #${data.id} verification FAILED`)

            throw e;
        }
    }
}