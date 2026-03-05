import { Component } from "../core/component";
import { Pipeline } from "../core/pipeline";
import { Parser } from "../pipeline/parser";
import { Tokenizer } from "../pipeline/tokenizer";
import { State } from "../core/state";
import { Evaluator } from "../pipeline/evaluator";
import { EventBus } from "../core/event-bus";

export class Scanner {

    public async scan(el: HTMLElement): Promise<Component[]> {
        const results = el.querySelectorAll("[y], [y-init]");
        const elements = Array.from(results).filter(e => e instanceof HTMLElement) as HTMLElement[];

        const components: Component[] = [];

        // --- PASS 1: create components and attach pipelines ---
        for (const element of elements) {

            const hasInit = element.hasAttribute("y-init");
            const nearestScope = this.findNearestYInit(element, components);
            const scopeState = nearestScope?.scope ?? null;

            const localState = new State();
            const component = new Component(
                element,
                localState,
                hasInit ? localState : scopeState,
                nearestScope
            );

            if (hasInit) {
                component.isScopeRoot = true;
            }

            // Attach pipelines from y attribute (registers triggers)
            const yAttr = element.getAttribute("y");
            if (yAttr) {
                const pipeline = this.createPipeline(component, yAttr);
                component.pipelines.push(pipeline);
            }

            components.push(component);
        }

        // --- PASS 2: evaluate y-init after pipelines registered ---
        for (const component of components) {
            const initAttr = component.element.getAttribute("y-init");
            if (initAttr) {
                await this.handleInit(component, initAttr);
            }
        }

        return components;
    }

    private createPipeline(subject: Component, pipeline_text: string): Pipeline {
        const tokenizer = new Tokenizer(pipeline_text);
        const tokens = tokenizer.Tokenize();
        console.log("Tokens:", tokens);
        const parser = new Parser(tokens);
        const pipeline = parser.Parse(subject);
        // Register triggers with the eventbus
        const eventbus = EventBus.getInstance()
        for (const trigger of pipeline.triggers) {
            if (["load", "submit"].includes(trigger)) {
                subject.element.addEventListener(trigger, (evt) => { pipeline.execute(); evt.preventDefault()})
            } else {
                eventbus.subscribe(trigger, pipeline)
            }
        }
        return pipeline
    }

    private async handleInit(subject: Component, init_text: string): Promise<void> {
        const tokenizer = new Tokenizer(init_text);
        const tokens = tokenizer.Tokenize();
        console.log("Tokens:", tokens);
        const parser = new Parser(tokens);
        const assignments = await parser.ParseInit();
        const evaluator = new Evaluator(subject);
        evaluator.evalAssignments(assignments);
    }

    private findNearestYInit(element: HTMLElement, components: Component[]): Component | null {
        let parent = element.parentElement;

        while (parent) {
            if (parent === document.body) return null;

            const result = components.find(c => c.element === parent);
            if (result && result.isScopeRoot) return result;

            parent = parent.parentElement;
        }

        return null;
    }
}