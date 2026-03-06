import { Component } from "../core/component"
import { Assignment } from "../pipeline/ast"
import { Evaluator } from "../pipeline/evaluator"

export class MutationStep {
    mutations: Assignment[]

    constructor(mutations: Assignment[]) {
        this.mutations = mutations
    }

    public execute(host: Component) {
        const evaluator = new Evaluator(host)
        evaluator.evalAssignments(this.mutations)
    }
}