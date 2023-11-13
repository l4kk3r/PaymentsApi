import ILogger from "./ILogger";

export default interface ILoggerFactory {
    create(source: string): ILogger
}