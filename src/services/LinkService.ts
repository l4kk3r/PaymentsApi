import IPaymentService from "./interfaces/IPaymentService";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import DomainError from "../errors/DomainError";
import IYooMoneyService from "./interfaces/IYooMoneyService";
import ICryptoService from "./interfaces/ICryptoService";
import ILinkService from "./interfaces/ILinkService";
import ICardService from "./interfaces/ICardService";

@injectable()
export default class LinkService implements ILinkService {
    @inject(TYPES.ICardService) private _cardService: ICardService
    @inject(TYPES.ICryptoService) private _cryptoCloudService: ICryptoService
    @inject(TYPES.IYooMoneyService) private _yoomoneyService: IYooMoneyService

    async generate(parameters: GenerateLinkParameters): Promise<string> {
        const paymentMethod = parameters.paymentMethod

        let provider: IPaymentService;
        if (paymentMethod == "card") {
            provider = this._cardService
        } else if (paymentMethod == "crypto") {
            provider = this._cryptoCloudService
        } else if (paymentMethod == "yoomoney") {
            provider = this._yoomoneyService
        } else {
            throw new DomainError("Incorrect payment method")
        }

        return await provider.generateLink(parameters)
    }
}