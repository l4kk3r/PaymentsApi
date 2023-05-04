import {request, response, next, Controller, controller, httpPost} from "inversify-express-utils";
import {inject} from "inversify";
import {TYPES} from "../di/types";
import {NextFunction, Response} from "express";
import ConfirmCryptoCloudPaymentRequest from "../requests/ConfirmCryptoCloudPaymentRequest";
import ConfirmPaymentParameters from "../services/parameters/ConfirmPaymentParameters";
import ConfirmYoomoneyPaymentRequest from "../requests/ConfirmYoomoneyPaymentRequest";
import IYooMoneyService from "../services/interfaces/IYooMoneyService";
import ICryptoCloudService from "../services/interfaces/ICryptoCloudService";


@controller('/payment')
export class PaymentController implements Controller {
    @inject(TYPES.ICryptoCloudService) private _cryptoCloudService: ICryptoCloudService
    @inject(TYPES.IYooMoneyService) private _yoomoneyService: IYooMoneyService

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
    }

    @httpPost('/confirm/yoomoney')
    private async confirmYoomoney(
        @request() request: ConfirmYoomoneyPaymentRequest,
        @response() response: Response,
        @next() next)
    {
        console.log('Received payment request')

        const {operation_id, amount, currency, label, sha1_hash, datetime, sender, codepro, notification_type} = request.body

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
    }
}