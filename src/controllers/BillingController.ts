import {request, response, next, Controller, controller, httpPost} from "inversify-express-utils";
import {inject} from "inversify";
import {TYPES} from "../di/types";
import {Response} from "express";
import ConfirmYookassaPaymentRequest from "../requests/ConfirmYookassaPaymentRequest";
import IPaymentService from "../services/interfaces/IPaymentService";

@controller('/billing')
export class BillingController implements Controller {
    @inject(TYPES.PaymentService) private _paymentService: IPaymentService

    @httpPost('/confirm/yookassa')
    private async confirmYookassa(
        @request() request: ConfirmYookassaPaymentRequest,
        @response() response: Response,
        @next() next)
    {
        const data = request.body.object
        if (request.body.event != 'payment.succeeded')
            return response.send()

        console.log('Received payment request')

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

            console.log(`Payment request #${data.id} is verified`)

            response.send()
        } catch (e) {
            console.log(`Payment request #${data.id} verification FAILED`)

            throw e;
        }
    }
}