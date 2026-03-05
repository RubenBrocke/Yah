

export type RenderStep = SelfTemplateRenderStep | LocalTemplateRenderStep | RemoteTemplateRenderStep

export class SelfTemplateRenderStep {
    selector: string = "."
}

export class LocalTemplateRenderStep {
    selector: string

    constructor(selector: string) {
        this.selector = selector;
    }
}

export class RemoteTemplateRenderStep {
    endpoint: string

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }
}