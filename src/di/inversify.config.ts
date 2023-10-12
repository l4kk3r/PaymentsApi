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

import "../controllers/LinkController";
import "../controllers/PaymentController"
import "../controllers/StatusController"
import "../controllers/KeyController"

import ICryptoCloudService from "../services/interfaces/ICryptoCloudService";
import databasePool from "./databasePool";
import {Pool} from "pg";
import IRepository from "../repositories/interfaces/IRepository";
import Repository from "../repositories/Repository";
import IKeyService from "../services/interfaces/IKeyService";
import KeyService from "../services/KeyService";

const container = new Container()

container.bind<Pool>(TYPES.DatabasePool).toConstantValue(databasePool)

container.bind<ICryptoService>(TYPES.ICryptoService).to(CryptoCloudService)
container.bind<ICardService>(TYPES.ICardService).to(YoomoneyService)
container.bind<ICryptoCloudService>(TYPES.ICryptoCloudService).to(CryptoCloudService)
container.bind<IYooMoneyService>(TYPES.IYooMoneyService).to(YoomoneyService)
container.bind<ILinkService>(TYPES.ILinkService).to(LinkService)
container.bind<IKeyService>(TYPES.IKeyService).to(KeyService)
container.bind<IPaymentRepository>(TYPES.IPaymentRepository).to(PaymentRepository).inSingletonScope()
container.bind<IRepository>(TYPES.IRepository).to(Repository).inSingletonScope();

export { container }