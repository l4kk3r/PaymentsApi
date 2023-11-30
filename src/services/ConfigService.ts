import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import IConfigService from "./interfaces/IConfigService";
import Config from "../models/Config";
import IServerService from "./interfaces/IServerService";
import IRepository from "../infrastructure/interfaces/IRepository";

@injectable()
export default class ConfigService implements IConfigService {
    @inject(TYPES.ServerService) private _serverService: IServerService
    @inject(TYPES.Repository) private _repository: IRepository

    async getKeyByIdentifier(identifier: string): Promise<string> {
        const serverIp = this._serverService.getRandomActiveServer()
        const config = await this._repository.getSubscriptionConfig(0, serverIp);

        return config.data;
    }

    private async generateConfig(subscriptionId: number, serverIp: string): Promise<Config> {
        const { ip, keyId, accessUrl } = await this._serverService.createKey(serverIp)

        const config = new Config(0, accessUrl, ip, keyId, true, subscriptionId);
        await this._repository.createConfig(config)

        return config
    }

    async deactivate(id: number) {
        const config = await this._repository.getConfig(id)

        await this._serverService.deactivateKey(config.server, config.keyId)
        await this._repository.deactivateConfig(id)
    }
 }
