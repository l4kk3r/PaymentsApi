import {injectable} from "inversify";
import ILoggerFactory from "./interfaces/ILoggerFactory";
import ILogger from "./interfaces/ILogger";
import Logger from "./Logger";

@injectable()
export default class LoggerFactory implements ILoggerFactory {
    create(source: string): ILogger {
        return new Logger(source)
    }
}