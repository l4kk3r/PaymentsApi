import { Container } from "inversify";
import { TYPES } from "./types";

import PaymentService from "../services/PaymentService";

import MessageBroker from "../infrastructure/MessageBroker";
import IMessageBroker from "../infrastructure/interfaces/IMessageBroker";
import IPaymentService from "../services/interfaces/IPaymentService";

import "../controllers/PaymentController";
import "../controllers/BillingController"
import "../controllers/KeyController"
import "../controllers/StatusController"
import "../controllers/SubscriptionController"

import databasePool from "./databasePool";
import {Pool} from "pg";
import IRepository from "../infrastructure/interfaces/IRepository";
import Repository from "../infrastructure/Repository";
import IServerService from "../services/interfaces/IServerService";
import ServerService from "../services/ServerService";
import IConfigService from "../services/interfaces/IConfigService";
import ConfigService from "../services/ConfigService";
import YookassaService from "../services/YookassaService";
import IEmailService from "../services/interfaces/IEmailService";
import NodemailerService from "../services/NodemailerService";
import IBillingService from "../services/interfaces/IBillingService";
import ISubscriptionService from "../services/interfaces/ISubscriptionService";
import SubscriptionService from "../services/SubscriptionService";
import IJob from "../jobs/interfaces/IJob";
import RenewJob from "../jobs/RenewJob";
import ILoggerFactory from "../infrastructure/interfaces/ILoggerFactory";
import LoggerFactory from "../infrastructure/LoggerFactory";
import ICrmService from "../services/interfaces/ICrmService";
import ExcelService from "../services/ExcelService";
import IEncryptionService from "../services/interfaces/IEncryptionService";
import EncryptionService from "../services/EncryptionService";
import CachedRepository from "../infrastructure/CachedRepository";
import ICachedRepository from "../infrastructure/interfaces/ICachedRepository";

const container = new Container()

container.bind<Pool>(TYPES.DatabasePool).toConstantValue(databasePool)

container.bind<IBillingService>(TYPES.YookassaService).to(YookassaService)
container.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService)
container.bind<ISubscriptionService>(TYPES.SubscriptionService).to(SubscriptionService)
container.bind<IServerService>(TYPES.ServerService).to(ServerService)
container.bind<IConfigService>(TYPES.ConfigService).to(ConfigService)
container.bind<IEmailService>(TYPES.EmailService).to(NodemailerService).inSingletonScope()
container.bind<ICrmService>(TYPES.CrmService).to(ExcelService).inSingletonScope()
container.bind<IEncryptionService>(TYPES.EncryptionService).to(EncryptionService)

container.bind<IMessageBroker>(TYPES.MessageBroker).to(MessageBroker).inSingletonScope()
container.bind<IRepository>(TYPES.Repository).to(Repository)
container.bind<ICachedRepository>(TYPES.CachedRepository).to(CachedRepository).inSingletonScope()

container.bind<IJob>(TYPES.RenewJob).to(RenewJob)
container.bind<ILoggerFactory>(TYPES.LoggerFactory).to(LoggerFactory).inSingletonScope()

export { container }