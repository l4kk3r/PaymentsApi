import FiscalData from "../parameters/FiscalData";

export default interface IBillingService {
    generateLink(amount: number, paymentId: number, returnUrl: string, fiscalData: FiscalData): Promise<string>

    verify(expectedAmount: number, realAmount: number, currency: string): boolean

    makeAutoPayment(secret: string, amount: number): Promise<boolean>
}