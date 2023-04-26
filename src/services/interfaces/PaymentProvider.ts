import GenerateLinkParameters from "../parameters/GenerateLinkParameters";

export default interface PaymentProvider {
    generateLink(generateParameters: GenerateLinkParameters): string
}