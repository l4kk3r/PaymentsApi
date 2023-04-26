import { Container } from "inversify";
import { TYPES } from "./types";

import CryptoCloudService from "../services/CryptoCloudService";
import YoomoneyService from "../services/YoomoneyService";
import LinkService from "../services/LinkService";

import "../controllers/LinkController";

const container = new Container();
container.bind<CryptoCloudService>(TYPES.CryptoCloudService).to(CryptoCloudService);
container.bind<YoomoneyService>(TYPES.YooMoneyService).to(YoomoneyService);
container.bind<LinkService>(TYPES.LinkService).to(LinkService);

export { container };