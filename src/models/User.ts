export default class User {
    constructor(
        public id: number,
        public readonly telegramId: number,
        public readonly username: string,
        public readonly source: string,
        public readonly email: string,
        public readonly refId?: number
    ) { }

}