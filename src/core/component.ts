// Every element with a y-init or y attribute will be converted into a Component.

class Component {
  el: HTMLElement;
  state: Record<string, any>; // each y-init attribute will add to the state
  pipelines: Pipeline[]; // each y attribute will create a pipeline

  constructor(el: HTMLElement) {
    this.el = el;
    this.state = {};
    this.pipelines = [];
  }
}
