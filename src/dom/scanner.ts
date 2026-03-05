import { Component } from "../core/component";
import { Pipeline } from "../core/pipeline";
import { Parser } from "../pipeline/parser";
import { Tokenizer } from "../pipeline/tokenizer";

export class Scanner {

    public async scan(el: HTMLElement): Promise<Component[]> {

        const elements = el.querySelectorAll("[y], [y-init]");
        const components: Component[] = [];
        for (const element of elements) {
            const pipelines: Pipeline[] = [];
            let state = new State();
            for (const attr of element.attributes) {
                if (attr.name === "y") {
                    const pipeline = this.createPipeline(attr.value);
                    pipelines.push(pipeline);
                }
                if (attr.name === "y-init") {
                    state = await this.handleInit(attr.value);
                }
            }
            const component = new Component(element as HTMLElement, state, null);
            component.pipelines = pipelines;
            component.enrichFromElement();
            components.push(component);
        }
        return components;
    }

    public createPipeline(pipeline_text: string): Pipeline {
        // TODO: parse pipeline text into triggers and steps
        const tokenizer = new Tokenizer(pipeline_text)
        const tokens = tokenizer.Tokenize()
        const parser = new Parser(tokens)
        return parser.Parse()
    }

    public async handleInit(init_text: string): Promise<State> {
        return State.fromInitText(init_text)
    }
}