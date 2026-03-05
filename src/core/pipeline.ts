import { Step } from "../steps/step";

export class Pipeline {
  triggers: string[]
  steps: Step[]

  constructor(triggers: string[], steps: Step[]) {
    this.triggers = triggers
    this.steps = steps
  }
}