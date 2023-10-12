import IKeyService from "./interfaces/IKeyService";
import {randomUUID} from "crypto";
import {inject, injectable} from "inversify";
import {TYPES} from "../di/types";
import IRepository from "../repositories/interfaces/IRepository";

@injectable()
export default class KeyService implements IKeyService {
    @inject(TYPES.IRepository) _repository: IRepository

    async getKeyByIdentifier(identifier: string): Promise<string> {
        const subscription = await this._repository.getSubscriptionByIdentifier(identifier);
        if (!subscription || subscription.isExpired()) {
            return "";
        }

        const configs = await this._repository.getSubscriptionConfigs(subscription.id);
        if (configs.length == 0) {
            return "";
        }
        const config = configs[Math.floor(Math.random() * configs.length)];

        return config.data;
    }
}