import winston from 'winston'
import {injectable} from "inversify"
import ILogger from "./interfaces/ILogger";

@injectable()
export default class Logger implements ILogger {
    private readonly _logger: winston.Logger

    constructor(source: string) {
        this._logger = winston.createLogger({
            level: 'info',
            format: winston.format.json(),
            defaultMeta: { source },
            transports: [
                new winston.transports.Console()
            ]
        })
    }

    log = (level: string, message: string) => {
        this._logger.log(level, message)
    }

    error = (message: string) => {
        this._logger.error(message)
    }

    info = (message: string) => {
        this._logger.info(message)
    }
}