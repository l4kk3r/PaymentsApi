import PaymentProvider from "./interfaces/PaymentProvider";
import {injectable} from "inversify";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";

@injectable()
export default class YoomoneyService implements PaymentProvider {
    generateLink(generateParameters: GenerateLinkParameters): string {
        return `https://yandex.ru/amount=${generateParameters.amount}`;
    }
}