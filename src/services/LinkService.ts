import IPaymentService from "./interfaces/IPaymentService";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";
import DomainError from "../errors/DomainError";
import IYooMoneyService from "./interfaces/IYooMoneyService";
import ICryptoService from "./interfaces/ICryptoService";
import ILinkService from "./interfaces/ILinkService";
import ICardService from "./interfaces/ICardService";
import GenerateLinkFromEmailParameters from "./parameters/GenerateLinkFromEmailParameters";
import IRepository from "../repositories/interfaces/IRepository";
import User from "../models/User";
import PaymentMessage from "../models/PaymentMessage";
import Payment from "../models/Payment";
import GetPlanById from "../utils/GetPlanById";

@injectable()
export default class LinkService implements ILinkService {
    @inject(TYPES.ICardService) private _cardService: ICardService
    @inject(TYPES.ICryptoService) private _cryptoCloudService: ICryptoService
    @inject(TYPES.IYooMoneyService) private _yoomoneyService: IYooMoneyService
    @inject(TYPES.IRepository) private _repository: IRepository

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

    async generateFromEmail(parameters: GenerateLinkFromEmailParameters): Promise<string> {
        const { service, paymentMethod, planId, email, returnUrl } = parameters

        const plan = GetPlanById(planId)
        if (plan == null)
            throw new DomainError("Invalid plan")

        let provider: IPaymentService;
        if (paymentMethod == "yookassa") {
            provider = this._yoomoneyService
        } else {
            throw new DomainError("Incorrect payment method")
        }

        let user = await this._repository.getUserByEmail(email)
        if (user == null) {
            user = new User(0, null, null, null, email)
            await this._repository.createUser(user)
        }

        const payment = new Payment(0, plan.price, user.id, user.id, planId, 'new')
        await this._repository.createPayment(payment)

        const generateParameters = {
            service,
            paymentMethod,
            amount: payment.amount,
            currency: "RUB",
            payload: payment.id.toString(),
            returnUrl
        }

        return await provider.generateLink(generateParameters)
    }
}