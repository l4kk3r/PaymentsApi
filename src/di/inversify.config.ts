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

const container = new Container()

container.bind<Pool>(TYPES.DatabasePool).toConstantValue(databasePool)

container.bind<IBillingService>(TYPES.YookassaService).to(YookassaService)
container.bind<IPaymentService>(TYPES.PaymentService).to(PaymentService)
container.bind<ISubscriptionService>(TYPES.SubscriptionService).to(SubscriptionService)
container.bind<IServerService>(TYPES.ServerService).to(ServerService)
container.bind<IConfigService>(TYPES.ConfigService).to(ConfigService)
container.bind<IMessageBroker>(TYPES.MessageBroker).to(MessageBroker).inSingletonScope()
container.bind<IRepository>(TYPES.Repository).to(Repository).inSingletonScope()
container.bind<IEmailService>(TYPES.EmailService).to(NodemailerService).inSingletonScope()

export { container }