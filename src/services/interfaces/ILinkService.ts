import GenerateLinkParameters from "../parameters/GenerateLinkParameters";

export default interface ILinkService {
    generate(parameters: GenerateLinkParameters): Promise<string>
}