import {injectable} from "inversify";
import IServerService from "./interfaces/IServerService";
import axios from "axios";
import ServerSettings from "../models/ServerSettings";

@injectable()
export default class ServerService implements IServerService {
    private readonly _servers: ServerSettings[]
    private readonly _activeServers: ServerSettings[]

    constructor() {
        const serversJson = JSON.parse(process.env.SERVERS)
        this._servers = serversJson.map(x => new ServerSettings(x.ip, x.port, x.key))

        const activeServersIps = JSON.parse(process.env.SERVERS_ACTIVE)
        this._activeServers = this._servers.filter(x => activeServersIps.includes(x.ip))
    }

    getRandomActiveServer(): string {
        const server = this._activeServers[Math.floor(Math.random() * this._activeServers.length)]
        return server.ip
    }

    async createKey(serverIp: string) {
        const server = this.getServerByIp(serverIp)

        const { ip, port, key } = server
        const response = await axios.post(`https://${ip}:${port}/${key}/access-keys`)
        const { id, accessUrl } = response.data

        return { ip, keyId: id, accessUrl }
    }

    async deactivateKey(serverIp: string, keyId: string): Promise<void> {
        const server = this.getServerByIp(serverIp)

        const { ip, port, key } = server
        await axios.delete(`https://${ip}:${port}/${key}/access-keys/${keyId}`)
    }

    private getServerByIp(serverIp: string): ServerSettings {
        const server = this._servers.find(x => x.ip == serverIp)
        if (!server)
            throw new Error('Server for deactivation not found')

        return server
    }
}