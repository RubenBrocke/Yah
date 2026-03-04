class Parser {
    constructor(text) {
        this.lexer = new Lexer(text);
        this.tokens = this.lexer.tokenize();
        this.index = 0;
    }
    match(type) {
        var _a;
        var _b, _c;
        (_a = (_b = this.tokens)[_c = this.index]) !== null && _a !== void 0 ? _a : (_b[_c] = { type: "eof" });
        return this.tokens[this.index].type === type;
    }
    peek() {
        var _a;
        var _b, _c;
        (_a = (_b = this.tokens)[_c = this.index]) !== null && _a !== void 0 ? _a : (_b[_c] = { type: "eof" });
        return this.tokens[this.index];
    }
    consume(type) {
        const token = this.peek();
        if (token.type !== type) {
            throw Error(`Expected token of type ${type} but got ${token.type}`);
        }
        this.index++;
        return token;
    }
    parseYInit() {
        if (this.match("method")) {
            const method = this.consume("method").value;
            const endpoint = this.consume("endpoint").value;
            return { type: "request", method, endpoint };
        }
        if (this.match("lbrace")) {
            this.consume("lbrace");
            const expressions = this.parseExpressions();
            this.consume("rbrace");
            return { type: "block", expressions };
        }
        throw Error();
    }
    parseEvents() {
        const events = [];
        while (this.peek().type === "at") {
            const name = this.consume("identifier").value;
            if (name === "change") {
                this.consume("lparen");
                const identifier = this.consume("identifier").value;
                this.consume("rparen");
                events.push({ type: "change", identifier });
            }
            else if (name === "every") {
                const interval = this.consume("number").value;
                const unit = this.consume("identifier").value;
                events.push({ type: "every", interval, unit });
            }
            else {
                events.push({ type: "event", name });
            }
        }
        return events;
    }
    parseTemplate() {
        if (this.peek().type === "endpoint") {
            return { type: "endpoint", endpoint: this.consume("endpoint").value };
        }
        else if (this.peek().type === "hash") {
            this.consume("hash");
            return { type: "node", selector: this.consume("identifier").value };
        }
        else if (this.peek().type === "dot") {
            this.consume("dot");
            return { type: "self" };
        }
        throw Error("Expected template reference");
    }
    parseTarget() {
        var result;
        if (this.peek().type === "hash") {
            this.consume("hash");
            result = { type: "node", selector: this.consume("identifier").value };
        }
        else if (this.peek().type === "dot") {
            this.consume("dot");
            result = { type: "self" };
        }
        else {
            throw Error("Expected target reference");
        }
        if (this.peek().type === "colon") {
            this.consume("colon");
            const mode = this.consume("identifier").value;
            return { ...result, mode };
        }
        return result;
    }
    parseY() {
        // Events should always exist
        const events = this.parseEvents();
        let request;
        if (this.peek().type === "method") {
            request = {
                method: this.consume("method").value,
                endpoint: this.consume("endpoint").value
            };
        }
        let render;
        if (this.match("arrow")) {
            const template = this.parseTemplate();
            const target = this.parseTarget();
            render = { template, target };
        }
        let expressions;
        if (this.match("lbrace")) {
            expressions = this.parseExpressions();
            this.consume("rbrace");
        }
        return { events, request, render, expressions };
    }
    parseYAction() {
        const events = this.parseEvents();
        this.consume("lbrace");
        const expressions = this.parseExpressions();
        this.consume("rbrace");
        return { events, expressions };
    }
    parseExpressions() {
        const expressions = [];
        do {
            expressions.push(this.parseAssignment());
        } while (this.match("comma"));
        return expressions;
    }
    parseAssignment() {
        const identifier = this.parseIdentifierOrMember();
        const op = this.consume("assoperator").value;
        const value = this.parseBinaryOp();
        return { type: "assignment", operator: op, target: identifier, value: value };
    }
    getPrecedence(op) {
        switch (op) {
            case "*":
            case "/": return 2;
            case "+":
            case "-": return 1;
            default: return 0;
        }
    }
    parseBinaryOp(precedence = 0) {
        let left = this.parseValue();
        while (this.match("operator") && this.getPrecedence(this.peek().value) > precedence) {
            const op = this.consume("operator").value;
            const right = this.parseBinaryOp(this.getPrecedence(op));
            left = { type: "binary", operator: op, left, right };
        }
        return left;
    }
    parseArray() {
        const elements = [];
        this.consume("lbracket");
        while (!this.match("rbracket")) {
            elements.push(this.parseValue());
            if (this.match("comma"))
                this.consume("comma");
        }
        this.consume("rbracket");
        return { type: "array", elements };
    }
    parseIdentifierOrMember() {
        let node = { type: "identifier", name: this.consume("identifier").name };
        while (this.match("dot")) {
            this.consume("dot");
            const prop = this.consume("identifier").name;
            node = { type: "member", object: node, property: prop };
        }
        return node;
    }
    parseValue() {
        const token = this.peek();
        switch (token.type) {
            case "number": return { type: "number", value: this.consume("number").value };
            case "string": return { type: "string", value: this.consume("string").value };
            case "boolean": return { type: "boolean", value: this.consume("boolean").value };
            case "lbracket": return this.parseArray();
            case "identifier": return this.parseIdentifierOrMember();
            default: throw new Error("Unexpected token " + token.type);
        }
    }
}
