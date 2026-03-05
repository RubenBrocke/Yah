import { Assignment } from "../pipeline/ast"

export class MutationStep {
    mutations: Assignment[]

    constructor(mutations: Assignment[]) {
        this.mutations = mutations
    }
}