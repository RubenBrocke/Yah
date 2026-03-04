export type Token =
    | { type: "at" }
    | { type: "arrow" }
    | { type: "lbrace" }
    | { type: "rbrace" }
    | { type: "lparen" }
    | { type: "rparen" }
    | { type: "lbracket" }
    | { type: "rbracket" }
    | { type: "comma" }
    | { type: "dot" }
    | { type: "hash" }
    | { type: "colon"}
    | { type: "identifier"; value: string }
    | { type: "number"; value: number }
    | { type: "string"; value: string }
    | { type: "boolean"; value: boolean }
    | { type: "operator"; value: "+" | "-" | "*" | "/" }
    | { type: "assoperator"; value: "=" | "+=" | "-=" | "*=" | "/=" }
    | { type: "method"; value: "GET" | "POST" | "PUT" | "PATCH" | "DELETE" }
    | { type: "endpoint"; value: string }
    | { type: "eof" };

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const BOOLEAN_LITERALS = ["true", "false"];

export class Lexer {
    private input: string;
    private index: number = 0;

    constructor(input: string) {
        this.input = input;
    }

    private peek(): string | null {
        return this.input[this.index] ?? null;
    }

    private next(): string | null {
        return this.input[this.index++] ?? null;
    }

    private isAlpha(char: string | null): boolean {
        return char !== null && /[a-zA-Z_\$]/.test(char);
    }

    private isDigit(char: string | null): boolean {
        return char !== null && /[0-9]/.test(char);
    }

    private skipWhitespace(): void {
        while (this.peek() && /\s/.test(this.peek()!)) this.next();
    }

    public tokenize(): Token[] {
        const tokens: Token[] = [];

        while (this.index < this.input.length) {
            this.skipWhitespace();
            const char = this.peek();
            if (!char) break;

            // Single-character tokens
            switch (char) {
                case "@": tokens.push({ type: "at" }); this.next(); continue;
                case "{": tokens.push({ type: "lbrace" }); this.next(); continue;
                case "}": tokens.push({ type: "rbrace" }); this.next(); continue;
                case "(": tokens.push({ type: "lparen" }); this.next(); continue;
                case ")": tokens.push({ type: "rparen" }); this.next(); continue;
                case "[": tokens.push({ type: "lbracket" }); this.next(); continue;
                case "]": tokens.push({ type: "rbracket" }); this.next(); continue;
                case ",": tokens.push({ type: "comma" }); this.next(); continue;
                case ".": tokens.push({ type: "dot" }); this.next(); continue;
                case "#": tokens.push({ type: "hash" }); this.next(); continue;
                case ":": tokens.push({ type: "colon" }); this.next(); continue;
                case "+": case "-": case "*": case "/":
                    const operator = char
                    this.next();
                    if (this.peek() === "=") {
                        tokens.push({ type: "assoperator", value: operator + "=" as any});
                        this.next();
                    } else if (operator === "-" && this.peek() === ">") {
                        tokens.push({ type: "arrow" });
                        this.next();
                    }
                    else {
                        tokens.push({ type: "operator", value: operator });
                    }
                    continue;
                case "=":
                    tokens.push({ type: "assoperator", value: "=" });
                    this.next();
                    continue;
            }

            // Numbers
            if (this.isDigit(char)) {
                let numStr = "";
                while (this.isDigit(this.peek()) || this.peek() === ".") numStr += this.next();
                tokens.push({ type: "number", value: parseFloat(numStr) });
                continue;
            }

            // Strings (single or double quotes)
            if (char === '"' || char === "'") {
                const quote = this.next();
                let str = "";
                while (this.peek() !== quote) {
                    if (!this.peek()) throw new Error("Unterminated string");
                    str += this.next();
                }
                this.next(); // consume closing quote
                tokens.push({ type: "string", value: str });
                continue;
            }

            // Identifiers / keywords / methods
            if (this.isAlpha(char)) {
                let ident = "";
                while (this.isAlpha(this.peek()) || this.isDigit(this.peek())) ident += this.next();

                if (METHODS.includes(ident.toUpperCase())) {
                    tokens.push({ type: "method", value: ident.toUpperCase() as any });
                } else if (BOOLEAN_LITERALS.includes(ident)) {
                    tokens.push({ type: "boolean", value: ident === "true" });
                } else {
                    tokens.push({ type: "identifier", value: ident });
                }
                continue;
            }

            throw new Error("Unexpected character: " + char);
        }

        tokens.push({ type: "eof" });
        return tokens;
    }
}