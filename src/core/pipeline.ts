import { HTTPStep } from "../steps/http";
import { MutationStep } from "../steps/mutation";
import { Step } from "../steps/step";
import { Component } from "./component";

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

        }
    }
}