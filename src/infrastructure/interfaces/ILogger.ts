export default interface ILogger {
    log(level: string, message: string): void

    error(message: string): void

    info(message: string): void
}