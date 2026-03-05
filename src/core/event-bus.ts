import { Component } from "./component";
import { Pipeline } from "./pipeline";


export class EventBus {
    listeners: Record<string, Pipeline[]>

    constructor() {
        this.listeners = {}
    }

    public subscribe(event: string, pipeline: Pipeline): void {
        if (!this.listeners[event]) {
            this.listeners[event] = [pipeline]
        } else {
            this.listeners[event].push(pipeline)
        }
    }

    public publish(source: Component, event: string): void {
        // A pipeline should only be triggered if the component is the same as the subject or a descendant of the subject
        console.log("Publishing event: " + event)
        const pipelines = this.listeners[event] || []
        pipelines.forEach(pipeline => {
            if (source === pipeline.parent || this.isDescendant(source, pipeline.parent)) {
                pipeline.execute()
            }
        })
    }

    private isDescendant(parent: Component, child: Component) {
        let current = child
        while (current != undefined) {
            current = child.parent
            if (current === parent)
                return true
        }
        return false
    }

    static getInstance(): EventBus {
        return instance
    }
}

const instance = new EventBus()