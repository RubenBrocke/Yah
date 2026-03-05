import { HttpMethod, SwapMode, Token, TokenType } from "./ast";


export class Tokenizer {
    text: string
    index: number

    constructor(text: string) {
        this.text = text;
        this.index = 0;
    }

    private skipWhitespace() {
        while (this.peek() == ' ') {
            this.index += 1
        }
    }

    private peek() {
        return this.text[this.index]
    }

    private take() {
        return this.text[this.index++]
    }

    private match(char: string): Boolean {
        this.skipWhitespace()
        return this.peek() === char;
    }

    private consume(char: string): string {
        this.skipWhitespace()
        const next_char = this.peek()
        if (next_char === char) {
            this.index++
            return next_char
        }
        throw new Error("")  
    }

    private consumeWhile(regex: RegExp): string {
        let next_char = this.peek()
        let result = ""
        while (regex.test(next_char)) {
            result += this.take()
            next_char = this.peek()
        }
        return result
    }

    public Tokenize(): Token[] {
        const tokens: Token[] = []
        while (this.index < this.text.length) {
            const next_char = this.take()

            switch (next_char) {
                case '@': tokens.push(new Token(TokenType.Atsign, "@")); break;
                case '#': tokens.push(new Token(TokenType.Hash, "#")); break;
                case '.': tokens.push(new Token(TokenType.Dot, ".")); break;
                case ',': tokens.push(new Token(TokenType.Comma, ",")); break;
                case '$': tokens.push(new Token(TokenType.Sign, "$")); break;
                case ':': tokens.push(new Token(TokenType.Colon, ":")); break;
                case '[': tokens.push(new Token(TokenType.LBracket, "[")); break;
                case ']': tokens.push(new Token(TokenType.RBracket, "]")); break;
                case '{': tokens.push(new Token(TokenType.LBrace, "{")); break;
                case '}': tokens.push(new Token(TokenType.RBrace, "}")); break;
                case '+':
                case '-':
                case '*':
                case '/': if (this.match("=")) { 
                        tokens.push(new Token(TokenType.AssignOperator, next_char + this.consume("=")))
                    } 
                    else {
                        tokens.push(new Token(TokenType.Operator, next_char))
                    }
                default:
                    if (/0-9/.test(next_char)) {
                        let num = this.take() + this.consumeWhile(/0-9/)
                        if (this.match(".")) {
                            num += this.consume(".") + this.consumeWhile(/0-9/)
                        }
                        tokens.push(new Token(TokenType.Number, num))
                    }
                    else if (/a-zA-Z_/.test(next_char)) {
                        const id = this.take() + this.consumeWhile(/a-zA-Z0-9_/)
                        if (Object.keys(HttpMethod).includes(id.toUpperCase()) {
                            tokens.push(new Token(TokenType.HTTPMethod, id))
                        }
                        else if (Object.keys(SwapMode).includes(id.toLowerCase())) {
                            tokens.push(new Token(TokenType.Swapmode,id))
                            break
                        }
                        else if (id.toLowerCase() === "render") {
                            tokens.push(new Token(TokenType.Render, "render"))
                        }
                        else {
                            tokens.push(new Token(TokenType.Identifier, id))
                        }

                    }
            }
        }
        tokens.push(new Token(TokenType.EOF, ""))
        return tokens
    }
}