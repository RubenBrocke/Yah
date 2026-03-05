import { Component } from "../core/component";
import { Assignment, BinaryOp, Expression, Primary, YArray, YBool, YGrouping, YIdentifier, YNumber, YObject, YString } from "./ast";

export class Evaluator {

    subject: Component

    constructor(subject: Component) {
        this.subject = subject
    }

    public evalAssignments(assignments: Assignment[]): void {
        assignments.map(assignment => this.evalAssignment(assignment))
    }

    public evalAssignment(assignment: Assignment): void {
        const ident = assignment.identifier
        const value = this.evalExpression(assignment.body)
        const current_value = this.subject.getStateValue(ident)
        let new_value: any
        switch (assignment.operator) {
            case "=":
                new_value = value
                break
            case "+=":
                if (typeof value === "number" || typeof value === "string") {
                    new_value = current_value + value
                } else if (typeof value === "object") {
                    new_value = current_value.push(value)
                }
                break
            case "-=":
                if (typeof value === "number") {
                    new_value = current_value - value
                } else if (typeof value === "object") {
                    new_value = current_value.filter((item: any) => item !== value)
                }
                break
            case "*=":
                if (typeof value === "number") {
                    new_value = current_value * value
                }
                break
            case "/=":
                if (typeof value === "number") {
                    new_value = current_value / value
                }
                break
        }
        this.subject.setStateValue(ident, new_value)
    }

    public evalExpression(expr: Expression): any {
        if (expr instanceof BinaryOp) {
            return this.evalBinaryOp(expr)
        } else {
            return this.evalPrimary(expr)
        }
    }

    private evalBinaryOp(expr: BinaryOp): any {
        const left = this.evalExpression(expr.left)
        const right = this.evalExpression(expr.right)
        switch (expr.operator) {
            case "+":
                return left + right
            case "-":
                return left - right
            case "*":
                return left * right
            case "/":
                return left / right
        }
    }

    private evalPrimary(expr: Primary): any {
        if (expr instanceof YBool) {
            return expr.bool
        }
        if (expr instanceof YNumber) {
            return expr.number
        }
        if (expr instanceof YString) {
            return expr.str
        }
        if (expr instanceof YIdentifier) {
            return this.subject.getStateValue(expr.ident)
        }
        if (expr instanceof YGrouping) {
            return this.evalExpression(expr.inner)
        }
        if (expr instanceof YArray) {
            return expr.items.map(item => this.evalExpression(item))
        }
        if (expr instanceof YObject) {
            const result: Record<string, any> = {}
            for (const key in expr.items) {
                result[key] = this.evalExpression(expr.items[key])
            }
            return result
        }
    }
}