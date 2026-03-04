

export type YInitAST =
    | {
        type: "request";
        method: HttpMethod;
        endpoint: string;
    }
    | {
        type: "block";
        expressions: Expression[];
    };

export type TemplateRef =
    | { type: "endpoint"; endpoint: string }
    | { type: "node"; selector: string }
    | { type: "self" };

export type SwapMode = "replace" | "append" | "prepend" | "insert" | "delete" | "before" | "after";

export type TargetRef =
    | { type: "node"; selector: string; mode: SwapMode }
    | { type: "self"; mode: SwapMode };

export type YAST = {
    events: EventNode[];
    request?: {
        method: HttpMethod;
        endpoint: string;
    };
    render?: {
        template: TemplateRef;
        target: TargetRef;
    };
    expressions?: Expression[];
};

export type YActionAST = {
    events: EventNode[];
    expressions: Expression[];
};

export type EventNode =
    | { type: "event"; name: string }
    | { type: "change"; identifier: string }
    | { type: "every"; interval: number; unit: "s" | "ms" };

export type Expression =
    | AssignmentExpression;

export type AssignmentExpression = {
    type: "assignment";
    operator: "=" | "+=" | "-=" | "*=" | "/=";
    target: IdentifierNode | MemberAccessNode;
    value: ValueNode;
};

export type ValueNode =
    | NumberNode
    | BooleanNode
    | StringNode
    | ArrayNode
    | BinaryOpNode
    | IdentifierNode
    | MemberAccessNode;

export type IdentifierNode = { type: "identifier"; name: string };
export type MemberAccessNode = { type: "member"; object: IdentifierNode | MemberAccessNode; property: string };

export type NumberNode = { type: "number"; value: number };
export type BooleanNode = { type: "boolean"; value: boolean };
export type StringNode = { type: "string"; value: string };
export type ArrayNode = { type: "array"; elements: ValueNode[] };
export type BinaryOpNode = { type: "binary"; operator: "+" | "-" | "*" | "/"; left: ValueNode; right: ValueNode };