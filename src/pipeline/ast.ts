

export enum TokenType {
    Atsign,
    Hash,
    Dot,
    Comma,
    Sign,
    Colon,
    LBracket,
    RBracket,
    LParen,
    RParen,
    LBrace,
    RBrace,
    AssignOperator,
    Operator,
    Number,
    String,
    Identifier,
    Render,
    HTTPMethod,
    Swapmode,
    EOF
}

export class Token {
    type: TokenType
    value: string

    constructor(type: TokenType, value: string) {
        this.type = type
        this.value = value
    }
}

export enum SwapMode {
    BEFORE = "before",
    AFTER = "after",
    INSERT = "insert",
    REPLACE = "replace"
}

export enum HttpMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export class Assignment {
    identifier: string
    operator: string
    body: Expression

    constructor(identifier: string, operator: string, body: Expression) {
        this.identifier = identifier
        this.operator = operator
        this.body = body
    }
}

export type Expression = BinaryOp | Primary
export type Primary = YNumber | YBool | YString | YIdentifier | YArray | YObject | YGrouping

export class BinaryOp {
    left: Expression
    operator: string
    right: Expression
}

export class YNumber {
    constructor(public number: number) {}
}

export class YBool {
    constructor(public bool: boolean) {}
}

export class YString {
    constructor(public str: string) {}
}

export class YIdentifier {
    constructor(public ident: string) {}
}

export class YArray {
    constructor(public items: Expression[]) {}
}

export class YObject {
    constructor(public items: Record<string, Expression>) {}
}

export class YGrouping {
    constructor(public inner: Expression) {}
}
