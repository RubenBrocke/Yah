class State {
    constructor() {
        this.data = [];
    }
    get(name) {
        var _a;
        return (_a = this.data.find((item) => item.name === name)) === null || _a === void 0 ? void 0 : _a.value;
    }
    set(name, value) {
        const item = this.data.find((item) => item.name === name);
        if (item) {
            item.value = value;
            // Trigger change listeners
            item.listeners.forEach((listener) => listener.callback());
        }
        else {
            this.data.push(new StateItem(name, value));
        }
    }
}
class StateItem {
    constructor(name, value) {
        this.name = name;
        this.value = value;
        this.listeners = [];
    }
}
