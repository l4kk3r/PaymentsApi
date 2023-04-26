import PaymentProvider from "./interfaces/PaymentProvider";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import DomainError from "../errors/DomainError";

@injectable()
export default class LinkService {
    @inject(TYPES.CryptoCloudService) private _cryptoCloudService: PaymentProvider
    @inject(TYPES.YooMoneyService) private _yoomoneyService: PaymentProvider

    public generate(generateParameters: GenerateLinkParameters): string {
        const paymentMethod = generateParameters.paymentMethod

        let provider: PaymentProvider;
        if (paymentMethod == "yoomoney") {
            provider = this._yoomoneyService
        } else if (paymentMethod == "crypto_cloud") {
            provider = this._cryptoCloudService
        } else {
            throw new DomainError("Incorrect payment method")
        }

        return provider.generateLink(generateParameters)
    }
}