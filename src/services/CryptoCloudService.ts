import PaymentProvider from "./interfaces/PaymentProvider";
import {injectable} from "inversify";
import GenerateLinkParameters from "./parameters/GenerateLinkParameters";

@injectable()
export default class CryptoCloudService implements PaymentProvider {
    generateLink(generateParameters: GenerateLinkParameters): string {
        return `https://cloudservice.com/amount=${generateParameters.amount}`;
    }
}