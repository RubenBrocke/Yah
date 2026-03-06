import { HTTPStep } from "../steps/http";
import { MutationStep } from "../steps/mutation";
import { Step } from "../steps/step";
import { LocalTemplateRenderStep, SelfTemplateRenderStep, RemoteTemplateRenderStep } from "../steps/render";
import { Component } from "./component";
import { SwapStep } from "../steps/swap";
import { State } from "./state";

export class Pipeline {
    triggers: string[]
    steps: Step[]
    parent: Component

    constructor(triggers: string[], steps: Step[], parent: Component) {
        this.triggers = triggers
        this.steps = steps
        this.parent = parent
    }

    public async execute(): Promise<void> {
        console.log("executed pipeline with " + this.steps.length + " steps" )
        let current_html = ""
        for (let i = 0; i < this.steps.length; i++) {
            const step = this.steps[i];
            if (step instanceof HTTPStep) {
                const data: Record<string, any> = await step.execute(this.parent)
                if (this.steps[i + 1] instanceof MutationStep) {
                    // This means we should push response.value to localState
                    for (const key in data) {
                        this.parent.localState.set(key, data[key])
                    }
                } else {
                    // This means we should do a shalow merge on scope
                    for (const key in data) {
                        this.parent.setStateValue(key, data[key])
                    }
                }
            }
            if (step instanceof LocalTemplateRenderStep || step instanceof SelfTemplateRenderStep || step instanceof RemoteTemplateRenderStep) {
                current_html = await step.execute(this.parent)
            }
            if (step instanceof MutationStep) {
                await step.execute(this.parent)
            }
            if (step instanceof SwapStep) {
                if (current_html.length === 0)
                    throw new Error("No template rendered for swap step")
                const new_node = globalThis.document.createElement("template")
                new_node.innerHTML = current_html
                await step.execute(this.parent, new_node.content.firstElementChild as HTMLElement)
                current_html = ""
            }
        }

        // If there is still a current_html value then we have insert that using default replace .
        if (current_html.length !== 0) {
            const new_step = new SwapStep("replace", ".")
            const new_node = globalThis.document.createElement("template") 
            new_node.innerHTML = current_html
            await new_step.execute(this.parent, new_node.content.firstElementChild as HTMLElement)
        }

        // Consider clearing localState of a non-init component for clean re-triggers
        if (!this.parent.isScopeRoot) {
            this.parent.localState = new State()
            this.parent.populateLocalState()
        }
    }
}