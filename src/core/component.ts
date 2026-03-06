// Every element with a y-init or y attribute will be converted into a Component.
import { EventBus } from "./event-bus";
import { Pipeline } from "./pipeline";
import { State } from "./state";

export class Component {
  element: HTMLElement
  localState: State          // local to this component
  scope: State               // nearest y-init ancestor's state
  parent: Component | null   // nearest y-init Component
  isScopeRoot: boolean       // Whether this component is defined as a scope root with y-init 
  pipelines: Pipeline[] = []

  constructor(element: HTMLElement, localState: State, scope: State, parent: Component | null) {
    this.element = element
    this.localState = localState
    this.scope = scope
    this.parent = parent
    this.isScopeRoot = false
  }

  public populateLocalState(): void {
    // Include element attributes in the state
    for (const attr of this.element.attributes) {
      if (attr.name == "y-init" || attr.name == "y") {
        continue
      }
      if (attr.name === "class") {
        // Create class object where each class is a key with the value true.
        const obj: Record<string, boolean> = {};
        attr.value.split(" ").forEach(cls => obj[cls] = true);
        this.localState.set("class", obj);
        continue;
      }
      this.localState.set(attr.name, attr.value);
    }
  }

  public getStateValue(name: string): any {
    const local = this.localState.get(name)
    if (local !== undefined) { return local}
    const value = this.scope.get(name);
    if (value !== undefined) { return value }
    if (this.parent) {
      return this.parent.getStateValue(name);
    }
    return undefined;
  }

  public setStateValue(name: string, value: any): void {
    // When setting we first need to check if a parent component has this state value
    // If it does, we should set it there, otherwise we set it in the local state
    if (this.parent && this.parent.getStateValue(name) !== undefined) {
      this.parent.setStateValue(name, value);
    } else {
      this.scope.set(name, value);
      // Trigger pipelines that depend on this state item (trigger event in event-bus)
      const eventbus = EventBus.getInstance()
      eventbus.publish(this, name)
    }
  }

  public mergeState(newState: Record<string, any>): void {
    for (const key in newState) {
      this.setStateValue(key, newState[key]);
    }
  }

  public dumpState(): Record<string, any> {
    const dump: Record<string, any> = {}

    // Merge local state first
    if (this.localState) {
        Object.assign(dump, this.localState.dump())
    }

    // Then merge scope
    if (this.scope) {
        Object.assign(dump, this.scope.dump())
    }
    // Then merge parent state
    if (this.parent) {
        Object.assign(dump, this.parent.dumpState())
    }

    return dump
}
}
