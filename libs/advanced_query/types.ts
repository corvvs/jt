export type QueryTokenType =
  | "key-value-separator" // :
  | "keypath-separator"   // .
  | "root"                // $
  | "paren-open"          // (
  | "paren-close"         // )
  | "bracket-open"        // [ (述語の開始)
  | "bracket-close"       // ] (述語の終了)
  | "and"                 // &
  | "or"                  // |
  | "key"                 // キーパスの1セグメント (部分ワイルドカード * を含みうる)
  | "descendant-wildcard" // ** (セグメント全体が ** のとき)
  | "value"               // : の後の値 (裸 or 引用形)
  | "end";

export type QueryToken = {
  type: QueryTokenType;
  token: string;
  /** type === "value" のとき: 引用形 ("...") で書かれたか */
  quoted?: boolean;
};

// ---- AST ----

export type GroupedQuery = {
  type: "GroupedQuery";
  op: "and" | "or";
  queries: (GroupedQuery | Query)[];
};

export type Query = {
  type: "Query";
  keyPathQuery?: KeyPathQuery;
  valueQuery?: ValueQuery;
};

export type KeyPathQuery = {
  type: "KeyPathQuery";
  /**
   * $ 前置. チェーンがルート直下から始まることを要求する.
   * 述語の中では「述語を付けたノードの直下から」の意味になる.
   */
  anchored: boolean;
  segments: SegmentQuery[];
};

export type SegmentQuery = {
  type: "SegmentQuery";
  /**
   * pattern: キー名との照合 (* は任意文字列のワイルドカード).
   * descendants: ** = 0個以上の任意セグメント.
   */
  kind: "pattern" | "descendants";
  pattern?: string;
  /** [ ... ] で付与された述語 (すべて満たすこと = AND) */
  predicates?: PredicateQuery[];
};

/**
 * 述語: セグメントが照合したノードの部分木が満たすべき条件.
 * 中身は単一の keypath(:value) クエリ (v1 では & | ( ) を許さない).
 */
export type PredicateQuery = {
  type: "PredicateQuery";
  query: Query;
};

export type ValueQuery = {
  type: "ValueQuery";
  token: string;
  /**
   * 引用形 ("...") なら文字列値との厳密一致.
   * 裸なら toString 比較 (数値・真偽値も文字列表現で比較) + null 特例.
   */
  quoted: boolean;
};

export type GenericQuery =
  | GroupedQuery
  | Query
  | KeyPathQuery
  | SegmentQuery
  | PredicateQuery
  | ValueQuery;
