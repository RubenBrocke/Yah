import { EventBus } from "./event-bus";

class StateItem {
    name: string
    value: any
}

export class State {
    items: StateItem[]

    constructor() {
        this.items = []
    }

    public set(name: string, value: any): void {
        const existingItem = this.items.find(item => item.name === name);
        if (existingItem) {
            existingItem.value = value;
        } else {
            this.items.push({ name, value });
        }
        console.log(`State updated: ${name} =`, value);
    }

    public merge(other: Record<string, any>): void {
        for (const key in other) {
            this.set(key, other[key]);
        }
    }

    public get(name: string): any {
        const item = this.items.find(item => item.name === name);
        return item ? item.value : undefined;
    }
}