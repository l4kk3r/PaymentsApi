import { Container } from "inversify";
import { TYPES } from "./types";

import CryptoCloudService from "../services/CryptoCloudService";
import YoomoneyService from "../services/YoomoneyService";
import LinkService from "../services/LinkService";

import PaymentRepository from "../repositories/PaymentRepository";
import IPaymentRepository from "../repositories/interfaces/IPaymentRepository";
import ICryptoService from "../services/interfaces/ICryptoService";
import ICardService from "../services/interfaces/ICardService";
import IYooMoneyService from "../services/interfaces/IYooMoneyService";
import ILinkService from "../services/interfaces/ILinkService";

const container = new Container()

import "../controllers/LinkController";
import "../controllers/PaymentController"
import ICryptoCloudService from "../services/interfaces/ICryptoCloudService";

container.bind<ICryptoService>(TYPES.ICryptoService).to(CryptoCloudService)
container.bind<ICardService>(TYPES.ICardService).to(YoomoneyService)
container.bind<ICryptoCloudService>(TYPES.ICryptoCloudService).to(CryptoCloudService)
container.bind<IYooMoneyService>(TYPES.IYooMoneyService).to(YoomoneyService)
container.bind<ILinkService>(TYPES.ILinkService).to(LinkService)
container.bind<IPaymentRepository>(TYPES.IPaymentRepository).to(PaymentRepository).inSingletonScope()

export { container }