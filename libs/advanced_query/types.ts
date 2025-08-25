export type QueryTokenType =
  | "key-value-separator"
  | "keypath-separator"
  // | "weak"
  | "root"
  | "match-target-specifier"
  | "paren-open"
  | "paren-close"
  | "and"
  | "or"
  | "single-key-wildcard"
  | "key"
  | "end"
  // | "value";

export type QueryToken = {
  type: QueryTokenType;
  token: string;
};

export type ValueQuery = {
  type: "ValueQuery";
  tokens: ValueQuerySubsidiary[];
  closed?: boolean;
};

export type KeyQuery = {
  type: "KeyQuery";
  position: "." | "$" | "@";
  string?: KeyStringQuery;
};

export type KeyPathQuery = {
  type: "KeyPathQuery";
  tokens: KeyPathQuerySubsidiary[];
  closed?: boolean;
};

export type Query = {
  type: "Query";
  keyPathQuery?: KeyPathQuery;
  valueQuery?: ValueQuery;
  closed?: boolean;
};

export type GroupedQuery = {
  type: "GroupedQuery";
  op: "and" | "or";
  queries: GroupedQuerySubsidiary[];
  closed?: boolean;
};

type QueryType = "ValueQuery" | "KeyPathQuery" | "Query" | "GroupedQuery";
type QueryGroup = QueryType | "KeyPathValueQuery";

export type TokenToQuery = {
  token: QueryTokenType;
  levels: QueryGroup[];
  mustCatch?: boolean;
};

export type AndQuery = {
  type: "AndQuery",
};

export type OrQuery = {
  type: "OrQuery",
};

export type RootQuery = {
  type: "RootQuery",
};

export type DotQuery = {
  type: "DotQuery",
};

export type AtQuery = {
  type: "AtQuery",
};

export type KeyStringQuery = {
  type: "KeyStringQuery",
  token: string;
};

export type SingleKeyWildcardQuery = {
  type: "SingleKeyWildcardQuery",
  token: "*";
};

export type CompoundQuery = GroupedQuery | Query | KeyPathQuery | ValueQuery;
export type GenericQuery = CompoundQuery | AndQuery | OrQuery | RootQuery | DotQuery | AtQuery | KeyStringQuery | SingleKeyWildcardQuery;
export type ValueQuerySubsidiary = KeyStringQuery;
export type KeyPathQuerySubsidiary = KeyQuery;
export type GroupedQuerySubsidiary = GroupedQuery | Query;

export function isKeyStringLikeQuery(q: GenericQuery): q is (KeyStringQuery | SingleKeyWildcardQuery) {
  return q.type === "KeyStringQuery" || q.type === "SingleKeyWildcardQuery";
}
