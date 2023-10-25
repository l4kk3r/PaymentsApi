import {request, response, next, Controller, controller, httpPost} from "inversify-express-utils";
import {inject} from "inversify";
import {TYPES} from "../di/types";
import {NextFunction, Request, Response} from "express";
import ConfirmCryptoCloudPaymentRequest from "../requests/ConfirmCryptoCloudPaymentRequest";
import ConfirmPaymentParameters from "../services/parameters/ConfirmPaymentParameters";
import ConfirmYoomoneyPaymentRequest from "../requests/ConfirmYoomoneyPaymentRequest";
import IYooMoneyService from "../services/interfaces/IYooMoneyService";
import ICryptoCloudService from "../services/interfaces/ICryptoCloudService";
import ConfirmYookassaPaymentRequest from "../requests/ConfirmYookassaPaymentRequest";
import IYookassaService from "../services/interfaces/IYookassaService";


@controller('/payment')
export class PaymentController implements Controller {
    @inject(TYPES.ICryptoCloudService) private _cryptoCloudService: ICryptoCloudService
    @inject(TYPES.IYookassaService) private _yookassaService: IYookassaService

    @httpPost('')
    private async method(        @request() request: Request,
                                 @response() response: Response,
                                 @next() next: NextFunction) {
        var requestBody = request;
        response.send()
    }

    @httpPost('/confirm/crypto_cloud')
    private async confirmCryptoCloud(
        @request() request: ConfirmCryptoCloudPaymentRequest,
        @response() response: Response,
        @next() next: NextFunction
    )
    {
        const {invoice_id, amount_crypto, currency, order_id, token} = request.body
        const confirmPaymentParameters = {
            uuid: invoice_id,
            amount: amount_crypto,
            currency,
            payload: order_id,
            verification: token
        } as ConfirmPaymentParameters

        await this._cryptoCloudService.confirmPayment(confirmPaymentParameters)

        response.send()
    }

    @httpPost('/confirm/yookassa')
    private async confirmYookassa(
        @request() request: ConfirmYookassaPaymentRequest,
        @response() response: Response,
        @next() next)
    {
        const data = request.body.object
        if (request.body.event != 'payment.succeeded')
            return

        console.log('Received payment request')


        try {
            const confirmPaymentParameters = {
                uuid: data.id,
                amount: data.amount.value,
                payload: data.metadata.payload,
                currency: data.amount.currency,
                verification: request.ip
            } as ConfirmPaymentParameters

            await this._yookassaService.confirmPayment(confirmPaymentParameters)

            console.log(`Payment request #${data.id} is verified, ip: ${request.ip}`)

            response.send()
        } catch (e) {
            console.log(`Payment request #${data.id} verification FAILED, ip: ${request.ip}`)

            response.status(500).send()
        }
    }

    /*
    @httpPost('/confirm/yoomoney')
    private async confirmYoomoney(
        @request() request: ConfirmYoomoneyPaymentRequest,
        @response() response: Response,
        @next() next)
    {
        console.log('Received payment request')
        const {operation_id, amount, currency, label, sha1_hash, datetime, sender, codepro, notification_type} = request.body

        try {
            const parameters = `${notification_type}&${operation_id}&${amount}&${currency}&${datetime}&${sender}&${codepro}&notification_secret&${label}`
            const verification = `${parameters}&${sha1_hash}`
            const confirmPaymentParameters = {
                uuid: operation_id,
                amount,
                payload: label,
                currency: 'RUB',
                verification
            } as ConfirmPaymentParameters

            await this._yoomoneyService.confirmPayment(confirmPaymentParameters)

            console.log(`Payment request #${operation_id} is verified`)

            response.send()
        } catch (e) {
            console.log(`Payment request #${operation_id} verification FAILED`)

            response.status(500).send()
        }
    } */
}