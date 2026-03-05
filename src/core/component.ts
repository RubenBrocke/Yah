// Every element with a y-init or y attribute will be converted into a Component.
import { Pipeline } from "./pipeline";

export class Component {
  el: HTMLElement;
  parent: Component | null;
  state: State; // each y-init attribute will add to the state
  pipelines: Pipeline[]; // each y attribute will create a pipeline

  constructor(el: HTMLElement, state: State, parent: Component | null) {
    this.el = el;
    this.state = state;
    this.parent = parent;
    this.pipelines = [];
  }

  public enrichFromElement(): void {
    // Include element attributes in the state
    for (const attr of this.el.attributes) {
      if (attr.name.startsWith("y-")) {
        continue
      }
      if (attr.name === "class") {
        // Create class object where each class is a key with the value true.
        const obj = {};
        attr.value.split(" ").forEach(cls => obj[cls] = true);
        this.state.set("class", obj);
        continue;
      }
      this.state.set(attr.name, attr.value);
    }
  }

  public getStateValue(name: string): any {
    const value = this.state.get(name);
    if (value !== undefined) {
      return value;
    }
    if (this.parent) {
      return this.parent.getStateValue(name);
    }
    return undefined;
  }
}
