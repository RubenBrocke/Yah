
class YahScope {
    parent: YahScope | null;
    el: HTMLElement;
    state: State;

    constructor(el: HTMLElement, parent: YahScope | null = null) {
        this.el = el;
        this.parent = parent;
        this.state = new State();
    }
}