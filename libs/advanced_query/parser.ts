import { GroupedQuery, KeyPathQuery, PredicateQuery, Query, QueryToken, SegmentQuery, ValueQuery } from "./types";
import { QuerySyntaxError } from "./QuerySyntaxError";

/**
 * トークン列を AST に構成する再帰下降パーサ.
 *
 * 文法:
 *   query     := orExpr <end>
 *   orExpr    := andExpr ("|" andExpr)*        ... & は | より強く結合する
 *   andExpr   := unit ("&" unit)*
 *   unit      := "(" orExpr ")" | simple
 *   simple    := keypath (":" value)? | ":" value
 *   keypath   := "$"? "."? segment ("." segment)*   ... 先頭の . は任意 (jq 風の癖を許す)
 *   segment   := (key | "**") predicate*
 *   predicate := "[" simple "]"
 *
 * 空クエリ (end のみ) は空配列を返す.
 */
class Parser {
  private pos = 0;

  constructor(private tokens: QueryToken[]) {}

  private peek(): QueryToken {
    return this.tokens[this.pos] ?? { type: "end", token: "" };
  }

  private next(): QueryToken {
    const t = this.peek();
    this.pos += 1;
    return t;
  }

  private expect(type: QueryToken["type"], subname: string, message: string) {
    const t = this.peek();
    if (t.type !== type) {
      throw new QuerySyntaxError(subname, message, { token: t, position: this.pos });
    }
    this.pos += 1;
  }

  parse(): (GroupedQuery | Query)[] {
    if (this.peek().type === "end") { return []; }
    const q = this.parseOr();
    if (this.peek().type !== "end") {
      throw new QuerySyntaxError("Unexpected Token", "クエリの終端の後に余分なトークンがあります", {
        token: this.peek(), position: this.pos,
      });
    }
    return [q];
  }

  private parseOr(): GroupedQuery | Query {
    const terms: (GroupedQuery | Query)[] = [this.parseAnd()];
    while (this.peek().type === "or") {
      this.pos += 1;
      terms.push(this.parseAnd());
    }
    return terms.length === 1 ? terms[0] : { type: "GroupedQuery", op: "or", queries: terms };
  }

  private parseAnd(): GroupedQuery | Query {
    const terms: (GroupedQuery | Query)[] = [this.parseUnit()];
    while (this.peek().type === "and") {
      this.pos += 1;
      terms.push(this.parseUnit());
    }
    return terms.length === 1 ? terms[0] : { type: "GroupedQuery", op: "and", queries: terms };
  }

  private parseUnit(): GroupedQuery | Query {
    if (this.peek().type === "paren-open") {
      this.pos += 1;
      const inner = this.parseOr();
      this.expect("paren-close", "Unclosed Paren", "( が閉じていません");
      return inner;
    }
    return this.parseSimple();
  }

  private parseSimple(): Query {
    const q: Query = { type: "Query" };
    const t = this.peek().type;
    if (t === "root" || t === "keypath-separator" || t === "key" || t === "descendant-wildcard") {
      q.keyPathQuery = this.parseKeyPath();
    }
    if (this.peek().type === "key-value-separator") {
      this.pos += 1;
      q.valueQuery = this.parseValue();
    }
    if (!q.keyPathQuery && !q.valueQuery) {
      throw new QuerySyntaxError("Empty Query", "キーパスまたは値の条件が必要です", {
        token: this.peek(), position: this.pos,
      });
    }
    return q;
  }

  private parseKeyPath(): KeyPathQuery {
    let anchored = false;
    if (this.peek().type === "root") {
      this.pos += 1;
      anchored = true;
    }
    if (this.peek().type === "keypath-separator") {
      this.pos += 1;
    }
    const segments: SegmentQuery[] = [this.parseSegment()];
    while (this.peek().type === "keypath-separator") {
      this.pos += 1;
      segments.push(this.parseSegment());
    }
    return { type: "KeyPathQuery", anchored, segments };
  }

  private parseSegment(): SegmentQuery {
    const t = this.peek();
    let segment: SegmentQuery;
    if (t.type === "key") {
      this.pos += 1;
      segment = { type: "SegmentQuery", kind: "pattern", pattern: t.token };
    } else if (t.type === "descendant-wildcard") {
      this.pos += 1;
      segment = { type: "SegmentQuery", kind: "descendants" };
    } else {
      throw new QuerySyntaxError("Key Expected", "キーが必要です", { token: t, position: this.pos });
    }

    while (this.peek().type === "bracket-open") {
      if (segment.kind === "descendants") {
        throw new QuerySyntaxError("Invalid Predicate", "** には述語 [ ] を付けられません", {
          token: this.peek(), position: this.pos,
        });
      }
      this.pos += 1;
      // 述語の中身は単一の keypath(:value). & | ( ) の組み合わせは v1 では非対応
      const inner = this.parseSimple();
      this.expect("bracket-close", "Unclosed Bracket", "[ が閉じていません");
      const predicate: PredicateQuery = { type: "PredicateQuery", query: inner };
      (segment.predicates ??= []).push(predicate);
    }
    return segment;
  }

  private parseValue(): ValueQuery {
    const t = this.peek();
    if (t.type !== "value") {
      throw new QuerySyntaxError("Value Expected", ": の後に値が必要です", { token: t, position: this.pos });
    }
    this.pos += 1;
    return { type: "ValueQuery", token: t.token, quoted: !!t.quoted };
  }
}

export const structurizeQuery = (tokens: QueryToken[]) => {
  return new Parser(tokens).parse();
};
