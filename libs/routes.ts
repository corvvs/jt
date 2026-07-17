import type { ParsedUrlQuery } from "querystring";

/**
 * catch-all ルート /{docId}[/diff/{otherDocId}] の構築と解釈を一箇所に集める.
 */

export function docPath(docId: string) {
  return `/${docId}`;
}

export function diffPath(docId: string, otherDocId: string) {
  return `/${docId}/diff/${otherDocId}`;
}

export function parseDocRoute(query: ParsedUrlQuery): {
  docId?: string;
  diffDocId?: string;
} {
  const [docId, subview, subviewId] = (query.docId || []) as string[];
  return {
    docId,
    diffDocId: subview === "diff" && subviewId ? subviewId : undefined,
  };
}
