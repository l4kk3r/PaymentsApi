import GenerateLinkParameters from "../parameters/GenerateLinkParameters";
import GenerateLinkFromEmailParameters from "../parameters/GenerateLinkFromEmailParameters";

export default interface ILinkService {
    generate(parameters: GenerateLinkParameters): Promise<string>

    generateFromEmail(parameters: GenerateLinkFromEmailParameters): Promise<string>
}