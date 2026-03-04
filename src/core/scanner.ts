import { Parser } from "../runtime/parser.js";
import { YAST, YInitAST, YActionAST } from "../runtime/ast.js";

export class Scanner {
    root: HTMLElement;

    constructor(root: HTMLElement) {
        this.root = root;
    }

    public scan(): (YInitAST | YActionAST | YAST)[] {
        const elements = this.root.querySelectorAll('[y], [y-init], [y-action]');
        const astNodes: (YInitAST | YActionAST | YAST)[] = [];
        elements.forEach(el => {
            console.log('Found element:', el);
            const y_value = el.getAttribute('y');
            if (y_value) {
                const parser = new Parser(y_value);
                const node = parser.parseY();
                astNodes.push(node);
            }
            if (el.hasAttribute('y-init')) {
                const init_value = el.getAttribute('y-init')!;
                const parser = new Parser(init_value);
                const node = parser.parseYInit();
                astNodes.push(node);
            }
            if (el.hasAttribute('y-action')) {
                const action_value = el.getAttribute('y-action')!;
                const parser = new Parser(action_value);
                const node = parser.parseYAction();
                astNodes.push(node);
            }
        });
        return astNodes;
    }
}