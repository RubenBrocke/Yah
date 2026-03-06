import { Component } from "../core/component"

export class SwapStep {
    mode: string
    target: string

    constructor(mode: string, target: string) {
        this.mode = mode
        this.target = target
    }

    public async execute(host: Component, newNode: HTMLElement) {
        let element: HTMLElement;
        if (this.target === ".") {
            element = host.element
        } else {
            element = globalThis.document.querySelector(this.target)
        }
        switch (this.mode) {
            case "before":
                element.before(newNode)
                break;
            case "after":
                element.after(newNode)
                break
            case "insert":
                element.appendChild(newNode)
                break
            default:
            case "replace":
                element.replaceWith(newNode)
                break;
        }
    }
}