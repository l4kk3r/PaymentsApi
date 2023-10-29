export default class User {
    constructor(
        public id: number,
        public readonly telegram_id: number,
        public readonly username: string,
        public readonly source: string,
        public readonly email: string,
        public readonly ref_id?: number
    ) { }

}