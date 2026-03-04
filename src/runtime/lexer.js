

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const BOOLEAN_LITERALS = ["true", "false"];
class Lexer {
    constructor(input) {
        this.index = 0;
        this.input = input;
    }
    peek() {
        var _a;
        return (_a = this.input[this.index]) !== null && _a !== void 0 ? _a : null;
    }
    next() {
        var _a;
        return (_a = this.input[this.index++]) !== null && _a !== void 0 ? _a : null;
    }
    isAlpha(char) {
        return char !== null && /[a-zA-Z_]/.test(char);
    }
    isDigit(char) {
        return char !== null && /[0-9]/.test(char);
    }
    skipWhitespace() {
        while (this.peek() && /\s/.test(this.peek()))
            this.next();
    }
    tokenize() {
        const tokens = [];
        while (this.index < this.input.length) {
            this.skipWhitespace();
            const char = this.peek();
            if (!char)
                break;
            // Single-character tokens
            switch (char) {
                case "@":
                    tokens.push({ type: "at" });
                    this.next();
                    continue;
                case "{":
                    tokens.push({ type: "lbrace" });
                    this.next();
                    continue;
                case "}":
                    tokens.push({ type: "rbrace" });
                    this.next();
                    continue;
                case "(":
                    tokens.push({ type: "lparen" });
                    this.next();
                    continue;
                case ")":
                    tokens.push({ type: "rparen" });
                    this.next();
                    continue;
                case "[":
                    tokens.push({ type: "lbracket" });
                    this.next();
                    continue;
                case "]":
                    tokens.push({ type: "rbracket" });
                    this.next();
                    continue;
                case ",":
                    tokens.push({ type: "comma" });
                    this.next();
                    continue;
                case ".":
                    tokens.push({ type: "dot" });
                    this.next();
                    continue;
                case "#":
                    tokens.push({ type: "hash" });
                    this.next();
                    continue;
                case ":":
                    tokens.push({ type: "colon" });
                    this.next();
                    continue;
                case "+":
                case "-":
                case "*":
                case "/":
                    const operator = char;
                    this.next();
                    if (this.peek() === "=") {
                        tokens.push({ type: "assoperator", value: operator + "=" });
                        this.next();
                    }
                    else if (operator === "-" && this.peek() === ">") {
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
                while (this.isDigit(this.peek()) || this.peek() === ".")
                    numStr += this.next();
                tokens.push({ type: "number", value: parseFloat(numStr) });
                continue;
            }
            // Strings (single or double quotes)
            if (char === '"' || char === "'") {
                const quote = this.next();
                let str = "";
                while (this.peek() !== quote) {
                    if (!this.peek())
                        throw new Error("Unterminated string");
                    str += this.next();
                }
                this.next(); // consume closing quote
                tokens.push({ type: "string", value: str });
                continue;
            }
            // Identifiers / keywords / methods
            if (this.isAlpha(char)) {
                let ident = "";
                while (this.isAlpha(this.peek()) || this.isDigit(this.peek()))
                    ident += this.next();
                if (METHODS.includes(ident.toUpperCase())) {
                    tokens.push({ type: "method", value: ident.toUpperCase() });
                }
                else if (BOOLEAN_LITERALS.includes(ident)) {
                    tokens.push({ type: "boolean", value: ident === "true" });
                }
                else {
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
