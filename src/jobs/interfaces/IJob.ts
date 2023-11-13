export default interface IJob {
    run(): Promise<void>
}