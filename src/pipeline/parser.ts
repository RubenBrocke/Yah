import { Pipeline } from "../core/pipeline";
import { Assignment, BinaryOp, Expression, Primary, Token, TokenType, YArray, YGrouping, YIdentifier, YNumber, YString, YObject } from "./ast"
import { Step } from "../steps/step";
import { HTTPStep } from "../steps/http";
import { LocalTemplateRenderStep, RemoteTemplateRenderStep, RenderStep, SelfTemplateRenderStep } from "../steps/render";
import { SwapStep } from "../steps/swap";
import { MutationStep } from "../steps/mutation";
import { Component } from "../core/component";

export class Parser {

    tokens: Token[]
    index: number

    constructor(tokens: Token[]) {
        this.tokens = tokens;
        this.index = 0;
    }

    private peek(): Token {
        return this.tokens[this.index]
    }

    private match(type: TokenType): boolean {
        const next_token = this.peek()
        return next_token.type == type
    }

    private consume(type: TokenType): Token {
        if (this.match(type)) {
            const token = this.tokens[this.index]
            this.index += 1
            return token
        }
        throw new Error(`${this.index} Expected token of type ${Object.values(TokenType)[type]} but got ${Object.values(TokenType)[this.peek().type]} with value '${this.peek().value}'`)
    }

    public Parse(source: Component): Pipeline {
        const triggers = this.parseTriggers()
        const steps = this.parseSteps()

        return new Pipeline(triggers, steps, source)
    }

    public ParseInit(): Assignment[] {
        this.consume(TokenType.LBrace)
        const assignments = this.parseAssignments()
        this.consume(TokenType.RBrace)
        return assignments
        
    }

    private parseTriggers(): string[] {
        const triggers: string[] = []
        while (this.match(TokenType.Atsign)) {
            this.consume(TokenType.Atsign) // Skip '@'
            const id = this.consume(TokenType.Identifier).value
            triggers.push(id)
        }
        return triggers;
    }

    private parseSteps(): Step[] {
        const steps: Step[] = []
        while (!this.match(TokenType.EOF)) {
            steps.push(this.parseStep())
        }
        return steps
    }

    private parseStep(): Step {
        // We will have to peek the first token to see what type of step to parse.
        const next_token = this.peek()
        switch (next_token.type) {
            case TokenType.HTTPMethod:
                return this.parseHttpStep()
            case TokenType.Render:
                return this.parseRenderStep()
            case TokenType.Swapmode:
                return this.parseSwapStep()
            case TokenType.LBrace:
                return this.parseMutationStep()
            default:
                throw new Error(`Unable to parse step ${next_token.value}`);
        }
    }

    private parseHttpStep(): HTTPStep {
        const method = this.consume(TokenType.HTTPMethod).value
        const endpoint = this.parseEndpoint()

        const step = new HTTPStep(method, endpoint)
        return step
    }

    private parseRenderStep(): RenderStep {
        this.consume(TokenType.Render)
        switch (this.peek().type) {
            case TokenType.Dot:
                this.consume(TokenType.Dot)
                return new SelfTemplateRenderStep()
            case TokenType.Hash:
                this.consume(TokenType.Hash);
                return new LocalTemplateRenderStep(this.consume(TokenType.Identifier).value)
            case TokenType.Operator:
                if (this.peek().value == "/") {
                    return new RemoteTemplateRenderStep(this.parseEndpoint())
                } else {
                    throw new Error("unable to parse render step")
                }
            default:
                throw new Error("unable to parse render step")
        }
    }

    private parseSwapStep(): SwapStep {
        const mode = this.consume(TokenType.Swapmode).value;
        if (this.match(TokenType.Hash)) {
            const selector = this.consume(TokenType.Identifier).value
            return new SwapStep(mode, selector)
        } else if (this.match(TokenType.Dot)) {
            this.consume(TokenType.Dot)
            return new SwapStep(mode, ".")
        } else {
            // Default selector is '.'
            return new SwapStep(mode, ".")
        }
    }

    private parseMutationStep(): MutationStep {
        this.consume(TokenType.LBrace)
        const assignments = this.parseAssignments()
        this.consume(TokenType.RBrace)
        return new MutationStep(assignments)
    }

    private parseAssignments(): Assignment[] {
        const assignments: Assignment[] = []
        while (!this.match(TokenType.RBrace) || this.match(TokenType.Comma)) {
            if (this.match(TokenType.Comma)) { this.consume(TokenType.Comma) }
            const assignment = this.parseAssignment()
            assignments.push(assignment)
        }
        return assignments
    }

    private parseAssignment(): Assignment {
        const identifier = this.parseIdentifier()
        const operator = this.consume(TokenType.AssignOperator).value
        const body = this.parseExpression()
        return new Assignment(identifier, operator, body)
    }

    private parseIdentifier(): string {
        let id = this.consume(TokenType.Identifier).value
        while (this.match(TokenType.Dot)) {
            id += this.consume(TokenType.Dot).value + this.consume(TokenType.Identifier).value
        }
        return id
    }

    private parseExpression(precedence: number = 0): Expression {
        let left: Expression = this.parsePrimary()

        while (true) {
            const token = this.peek()
            if (token.type !== TokenType.Operator) {
                break
            }

            const nextPrecedence = this.getPrecedence(token.value)
            if (nextPrecedence === 0 || precedence >= nextPrecedence) {
                break
            }

            const operator = this.consume(TokenType.Operator).value
            const binary = new BinaryOp()
            binary.left = left
            binary.operator = operator
            binary.right = this.parseExpression(nextPrecedence)
            left = binary
        }

        return left
    }

    private parsePrimary(): Primary {
        const next_token = this.peek()
        switch (next_token.type) {
            case TokenType.Identifier:
                return new YIdentifier(this.parseIdentifier())
            case TokenType.Number:
                return new YNumber(parseFloat(this.consume(TokenType.Number).value))
            case TokenType.String:
                return new YString(this.consume(TokenType.String).value)
            case TokenType.LParen:
                this.consume(TokenType.LParen)
                const expr = this.parseExpression()
                this.consume(TokenType.RParen)
                return new YGrouping(expr)
            case TokenType.LBracket:
                return this.parseArray()
            case TokenType.LBrace:
                return this.parseObject()
            default:
                throw new Error("Unable to parse primary expression")
        }
    }

    private parseArray(): YArray {
        this.consume(TokenType.LBracket)
        const items: Expression[] = []
        while (!this.match(TokenType.RBracket) || this.match(TokenType.Comma)) {
            if (this.match(TokenType.Comma)) { this.consume(TokenType.Comma) }
            items.push(this.parseExpression())
        }
        this.consume(TokenType.RBracket)
        return new YArray(items)
    }

    private parseObject(): YObject {
        this.consume(TokenType.LBrace)
        const properties: { [key: string]: Expression } = {}
        while (!this.match(TokenType.RBrace) && this.match(TokenType.Comma)) {
            if (this.match(TokenType.Comma)) { this.consume(TokenType.Comma) }
            const key = this.consume(TokenType.Identifier).value
            this.consume(TokenType.Colon)
            const value = this.parseExpression()
            properties[key] = value
        }
        this.consume(TokenType.RBrace)
        return new YObject(properties)
    }

    private getPrecedence(operator: string): number {
        if (operator === "+" || operator === "-") { return 1 }
        if (operator === "*" || operator === "/") { return 2 }
        return 0
    }

    private parseEndpoint(): string {
        const segments: string[] = []
        let consumedEndpoint = false

        while (true) {
            const token = this.peek()

            if (token.type === TokenType.Operator && token.value === "/") {
                segments.push(this.consume(TokenType.Operator).value)
                consumedEndpoint = true
                continue
            }

            if (token.type === TokenType.Identifier || token.type === TokenType.Number) {
                segments.push(this.consume(token.type).value)
                consumedEndpoint = true
                continue
            }

            if (token.type === TokenType.Dot) {
                segments.push(this.consume(TokenType.Dot).value)
                consumedEndpoint = true
                continue
            }

            break
        }

        if (!consumedEndpoint || segments.length === 0 || segments[0] !== "/") {
            throw new Error("Expected endpoint starting with '/' after HTTP method")
        }

        return segments.join("")
    }
}
