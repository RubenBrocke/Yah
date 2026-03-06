import { Component } from "../core/component";
import Mustache from "mustache"


export type RenderStep = SelfTemplateRenderStep | LocalTemplateRenderStep | RemoteTemplateRenderStep

export class SelfTemplateRenderStep {
    selector: string = "."

    public async execute(host: Component) {
        const element = host.element
        const text = element.innerHTML
        const view = host.dumpState()
        const html = Mustache.render(text, view)
        return html
    }
}

export class LocalTemplateRenderStep {
    selector: string

    constructor(selector: string) {
        this.selector = selector;
    }

    public async execute(host: Component) {
        const element = globalThis.document.querySelector(this.selector)
        const text = element.innerHTML
        const view = host.dumpState()
        const html = Mustache.render(text, view)
        return html
    }
}

export class RemoteTemplateRenderStep {
    endpoint: string

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    public async execute(host: Component) {
        const text = await (await fetch(this.endpoint)).text()
        const view = host.dumpState()
        const html = Mustache.render(text, view)
        return html
    }
}