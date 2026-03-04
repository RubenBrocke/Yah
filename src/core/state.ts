

class State {
    private data: StateItem[];

    constructor() {
        this.data = [];
    }

    
    public get(name: String) {
        return this.data.find((item) => item.name === name)?.value;
    }

    public set(name: String, value: any) {
        const item = this.data.find((item) => item.name === name);
        if (item) {
            item.value = value;
            // Trigger change listeners
            item.listeners.forEach((listener) => listener.callback());
        } else {
            this.data.push(new StateItem(name, value));
        }
    }
}

class StateItem {
    name: String;
    value: any;
    listeners: [Observer] | []

    constructor(name: String, value: any) {
        this.name = name;
        this.value = value;
        this.listeners = [];
    }
}