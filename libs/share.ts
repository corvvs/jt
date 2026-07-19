import type { DataFormat } from "../states/config/format";
import type { QueryMode, FilteringResultAppearanceOption } from "../states/manipulation/query";
import { deriveNarrowdRange } from "../states/manipulation/narrowing";
import { JsonRowItem } from "./jetson";
import { SHARED_ROUTE_DOC_ID } from "./routes";

/**
 * ビュー状態ごと URL 共有のコーデック.
 *
 * ドキュメント本文とビュー状態 (ナローイング・クエリ・フォールド) を
 * gzip + base64url で URL フラグメントに詰める. フラグメントはブラウザから
 * サーバに送信されないため, データはクライアントの外に出ない.
 *
 * toggle / narrowing は行 index ベースだが, 同一 json_string のパース結果は
 * index が決定論的に安定するため, 本文を同梱することでそのまま再現できる.
 */

// フラグメント外側のバージョンプレフィックス. gzip 展開前に形式判定できるようにする
export const SHARE_FRAGMENT_PREFIX = "j1.";

// URL 全長がこれを超えたら「貼り付け先で切り詰められるかも」と警告する
export const SHARE_URL_WARN_LENGTH = 100_000;
// URL 全長がこれを超えたら生成を拒否する
export const SHARE_URL_MAX_LENGTH = 1_500_000;
// 共有クエリ文字列の受け入れ上限
export const SHARE_QUERY_MAX_LENGTH = 10_000;

export type SharedViewState = {
  /** ナローイングスタック (from のみ. to は受信側で再導出する) */
  narrowedFroms: number[];
  /** フォールド済み (閉じている) 行 index */
  foldedIndexes: number[];
  query: string;
  queryMode: QueryMode;
  resultAppearance: FilteringResultAppearanceOption;
  showSearchPanel: boolean;
};

export type SharePayloadV1 = {
  v: 1;
  doc: {
    name: string;
    format: DataFormat;
    json_string: string;
  };
  view: SharedViewState;
};

export type ShareDecodeErrorKind =
  | "unsupported" // CompressionStream 非対応環境
  | "empty"       // フラグメントが空
  | "version"     // 未知のプレフィックス or v > 1
  | "base64"      // base64url 復号失敗
  | "gunzip"      // gzip 展開失敗
  | "json"        // JSON.parse 失敗
  | "schema";     // ペイロードの型検証失敗

export class ShareDecodeError extends Error {
  readonly kind: ShareDecodeErrorKind;
  constructor(kind: ShareDecodeErrorKind, message?: string) {
    super(message || `share decode failed: ${kind}`);
    this.kind = kind;
    Object.setPrototypeOf(this, ShareDecodeError.prototype);
  }
}

export function shareErrorMessage(e: unknown): string {
  if (e instanceof ShareDecodeError) {
    switch (e.kind) {
      case "unsupported":
        return "このブラウザは共有リンクの展開に対応していません";
      case "empty":
        return "共有リンクにデータが含まれていません";
      case "version":
        return "共有リンクの形式を解釈できません。ページを再読み込みしてから再度開いてみてください";
      case "base64":
      case "gunzip":
      case "json":
      case "schema":
        return "共有リンクが壊れています";
    }
  }
  return "共有リンクの取り込みに失敗しました";
}

export function isCompressionSupported(): boolean {
  return typeof CompressionStream !== "undefined" && typeof DecompressionStream !== "undefined";
}

async function gzipCompress(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes]).stream().pipeThrough(new CompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function gzipDecompress(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream("gzip"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

function bytesToBase64url(bytes: Uint8Array): string {
  let bin = "";
  const CHUNK = 0x8000;
  for (let i = 0; i < bytes.length; i += CHUNK) {
    const chunk = bytes.subarray(i, i + CHUNK);
    bin += String.fromCharCode.apply(null, chunk as unknown as number[]);
  }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function base64urlToBytes(s: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]+$/.test(s) || s.length % 4 === 1) {
    throw new ShareDecodeError("base64");
  }
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

export async function encodeSharePayload(payload: SharePayloadV1): Promise<string> {
  if (!isCompressionSupported()) {
    throw new ShareDecodeError("unsupported");
  }
  const raw = new TextEncoder().encode(JSON.stringify(payload));
  const compressed = await gzipCompress(raw);
  return SHARE_FRAGMENT_PREFIX + bytesToBase64url(compressed);
}

export async function decodeSharePayload(fragment: string): Promise<SharePayloadV1> {
  if (!isCompressionSupported()) {
    throw new ShareDecodeError("unsupported");
  }
  let body = fragment.startsWith("#") ? fragment.slice(1) : fragment;
  if (body.includes("%")) {
    // チャットアプリ等が URL を再エンコードした場合の救済
    try {
      body = decodeURIComponent(body);
    } catch (e) {
      // 元の文字列のまま続行
    }
  }
  if (body.length === 0) {
    throw new ShareDecodeError("empty");
  }
  if (!body.startsWith(SHARE_FRAGMENT_PREFIX)) {
    throw new ShareDecodeError(/^j[0-9]+\./.test(body) ? "version" : "base64");
  }
  const bytes = base64urlToBytes(body.slice(SHARE_FRAGMENT_PREFIX.length));
  let raw: Uint8Array;
  try {
    raw = await gzipDecompress(bytes);
  } catch (e) {
    throw new ShareDecodeError("gunzip");
  }
  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(raw));
  } catch (e) {
    throw new ShareDecodeError("json");
  }
  return validateSharePayload(parsed);
}

export async function deriveSharedDocId(doc: SharePayloadV1["doc"]): Promise<string> {
  // ビュー状態は含めない: 同じ JSON を別のビューで共有し直しても同一ドキュメントに収束させる
  const bytes = new TextEncoder().encode(JSON.stringify([doc.format, doc.name, doc.json_string]));
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const view = new Uint8Array(digest);
  let hex = "";
  for (let i = 0; i < view.length; i++) {
    hex += view[i].toString(16).padStart(2, "0");
  }
  return `shared-${hex.slice(0, 32)}`;
}

export function buildShareUrl(origin: string, encodedFragment: string): string {
  // base64url と "." はフラグメント中でそのまま合法なので encodeURIComponent は不要
  return `${origin}/${SHARED_ROUTE_DOC_ID}#${encodedFragment}`;
}

function isNumberArray(x: unknown): x is number[] {
  return Array.isArray(x) && x.every((n) => typeof n === "number");
}

export function validateSharePayload(x: unknown): SharePayloadV1 {
  if (typeof x !== "object" || x === null) {
    throw new ShareDecodeError("schema");
  }
  const p = x as { v?: unknown; doc?: unknown; view?: unknown };
  if (typeof p.v === "number" && p.v > 1) {
    throw new ShareDecodeError("version");
  }
  if (p.v !== 1) {
    throw new ShareDecodeError("schema");
  }
  const doc = p.doc as { name?: unknown; format?: unknown; json_string?: unknown } | null | undefined;
  if (
    !doc || typeof doc !== "object"
    || typeof doc.name !== "string"
    || (doc.format !== "json" && doc.format !== "jsonl")
    || typeof doc.json_string !== "string"
  ) {
    throw new ShareDecodeError("schema");
  }
  const view = p.view as {
    narrowedFroms?: unknown;
    foldedIndexes?: unknown;
    query?: unknown;
    queryMode?: unknown;
    resultAppearance?: unknown;
    showSearchPanel?: unknown;
  } | null | undefined;
  if (
    !view || typeof view !== "object"
    || !isNumberArray(view.narrowedFroms)
    || !isNumberArray(view.foldedIndexes)
    || typeof view.query !== "string"
    || typeof view.queryMode !== "string"
    || typeof view.resultAppearance !== "string"
    || typeof view.showSearchPanel !== "boolean"
  ) {
    throw new ShareDecodeError("schema");
  }
  // enum 値の妥当性は sanitizeSharedViewState 側でホワイトリスト照合する
  return {
    v: 1,
    doc: { name: doc.name, format: doc.format, json_string: doc.json_string },
    view: {
      narrowedFroms: view.narrowedFroms,
      foldedIndexes: view.foldedIndexes,
      query: view.query,
      queryMode: view.queryMode as QueryMode,
      resultAppearance: view.resultAppearance as FilteringResultAppearanceOption,
      showSearchPanel: view.showSearchPanel,
    },
  };
}

const QUERY_MODES: readonly QueryMode[] = ["simple", "advanced"];
const RESULT_APPEARANCES: readonly FilteringResultAppearanceOption[] = [
  "just", "ascendant", "descendant", "ascendant_descendant", "lightup",
];

export type SanitizedViewState = {
  narrowedRanges: { from: number; to: number }[];
  toggleState: { [index: number]: boolean };
  query: string;
  queryMode: QueryMode;
  resultAppearance: FilteringResultAppearanceOption;
  showSearchPanel: boolean;
};

/**
 * デコード済みビュー状態を実際の行アイテム列に対して検証し, atom に入れられる形へ変換する.
 * index が範囲外・折りたたみ不能な行・ネストの壊れたナローイングは黙って捨てる
 * (共有リンクの破損でクラッシュや空表示より, 部分再現の方がまし).
 */
export function sanitizeSharedViewState(view: SharedViewState, items: JsonRowItem[]): SanitizedViewState {
  const isTogglableIndex = (i: number): boolean =>
    Number.isInteger(i) && 0 <= i && i < items.length
    && (items[i].right.type === "array" || items[i].right.type === "map");

  // ナローイング: from から to を再導出しつつ, スタックのネスト (内側ほど狭い) を検証.
  // 違反を見つけた段からは積まない (prefix 採用)
  const narrowedRanges: { from: number; to: number }[] = [];
  for (const from of view.narrowedFroms) {
    if (!isTogglableIndex(from)) { break; }
    const range = deriveNarrowdRange(from, items);
    const prev = narrowedRanges[narrowedRanges.length - 1];
    if (prev && !(prev.from <= range.from && range.to <= prev.to)) { break; }
    narrowedRanges.push(range);
  }

  const toggleState: { [index: number]: boolean } = {};
  for (const i of view.foldedIndexes) {
    if (isTogglableIndex(i)) {
      toggleState[i] = true;
    }
  }

  return {
    narrowedRanges,
    toggleState,
    query: view.query.slice(0, SHARE_QUERY_MAX_LENGTH),
    queryMode: QUERY_MODES.indexOf(view.queryMode) >= 0 ? view.queryMode : "simple",
    resultAppearance: RESULT_APPEARANCES.indexOf(view.resultAppearance) >= 0 ? view.resultAppearance : "lightup",
    showSearchPanel: !!view.showSearchPanel,
  };
}
