
class StateItem {
    name: string
    value: any
}

class State {
    items: StateItem[]

    public set(name: string, value: any): void {
        const existingItem = this.items.find(item => item.name === name);
        if (existingItem) {
            existingItem.value = value;
        } else {
            this.items.push({ name, value });
        }
        // TODO: trigger pipelines that depend on this state item (trigger event in event-bus)
    }

    public merge(other: any): void {
        for (const key in other) {
            if (other.hasOwnProperty(key)) {
                this.set(key, other[key]);
            }
        }
    }

    public get(name: string): any {
        const item = this.items.find(item => item.name === name);
        return item ? item.value : undefined;
    }

    static async fromInitText(init_text: string): Promise<State> {
        // TODO: Implement parsing of init text into state values
        if (init_text.startsWith("/")) {
            // This is a remote state, fetch from server
            const request = new YahRequest();
            request.endpoint = init_text;
            request.method = "GET";
            request.params = {};
            const responseText = await request.do();
            const obj = JSON.parse(responseText);
            const state = new State();
            state.merge(obj);
            return state;
        }
        if (init_text.startsWith("{")) {
            // This is a local state, we should parse as expressions
            const state = new State();
            // TODO: implement expression parsing
            return state
        }
    }
}