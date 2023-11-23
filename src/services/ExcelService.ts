import {GoogleSpreadsheet} from 'google-spreadsheet';
import { JWT } from 'google-auth-library'
import ICrmService from "./interfaces/ICrmService";
import {inject, injectable} from "inversify";
import Subscription from "../models/Subscription";
import {TYPES} from "../di/types";
import GetPlanById from "../utils/GetPlanById";
import Repository from "../infrastructure/Repository";

@injectable()
export default class ExcelService implements ICrmService {
    private readonly EXCEL_FORMAT = "dd.MM.yyyy hh:mm:ss";
    private readonly TIMESTAMP_CELL = "L2";
    private readonly SUBSCRIPTION_END_COLUMN = "I";

    spreadsheet : GoogleSpreadsheet

    @inject(TYPES.Repository) private _repository: Repository

    constructor() {
        const serviceAccountAuth = new JWT({
            email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
            key: process.env.GOOGLE_PRIVATE_KEY.split(String.raw`\n`).join('\n'),
            scopes: [
                'https://www.googleapis.com/auth/spreadsheets',
            ]
        });

        this.spreadsheet = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET_ID, serviceAccountAuth);
    }

    public async writeSubscription(subscription: Subscription) {
        const worksheet = await this.getWorksheet()
        const codeRow = worksheet.rowCount

        const user = await this._repository.getUserById(subscription.userId)
        const plan = GetPlanById(subscription.planId)
        const startDate = subscription.startAt
        const endDate = subscription.endAt

        if (!user) {
            throw new Error('User not exists')
        }

        if (!plan) {
            throw new Error('Plan not exists')
        }

        await worksheet.addRow({
            'Номер подписки': subscription.id,
            'Статус': 'Продан',
            'Номер пользователя': user.id.toString(),
            'Телеграм юзера': user.username ?? '',
            'Почта': user.email ?? '',
            'Источник': user.source ?? '',
            'План': plan.name,
            'Начало подписки': startDate.toFormat(this.EXCEL_FORMAT),
            'Конец подписки': endDate.toFormat(this.EXCEL_FORMAT),
            'Осталось дней':  this.getSubscriptionEndFunction(codeRow)
        }, { insert: true })
    }

    updateSubscription = async (subscription: Subscription) => {
        const worksheet = await this.getWorksheet()
        const rows = await worksheet.getRows()

        for (let row of rows) {
            if (row.get('Номер подписки') == subscription.id) {
                const plan = GetPlanById(subscription.planId)
                const endDate = subscription.endAt

                row.assign({
                    'План': plan.name,
                    'Статус': 'Продлен',
                    'Конец подписки': endDate.toFormat(this.EXCEL_FORMAT),
                    'Осталось дней': this.getSubscriptionEndFunction(row.rowNumber)
                })

                await row.save()
                break;
            }
        }
    }

    private getWorksheet = async () => {
        await this.spreadsheet.loadInfo();
        const worksheet = this.spreadsheet.sheetsByIndex[0]
        await worksheet.loadCells();
        return worksheet;
    }

    private getSubscriptionEndFunction = (rowNumber: number) => `=ISO.CEILING(MAX(${this.SUBSCRIPTION_END_COLUMN}${rowNumber}-${this.TIMESTAMP_CELL};0))`;
}