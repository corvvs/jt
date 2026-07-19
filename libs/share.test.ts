import { describe, expect, it } from "vitest";
import { flattenJson } from "./jetson";
import {
  SHARE_FRAGMENT_PREFIX,
  SharePayloadV1,
  ShareDecodeError,
  buildShareUrl,
  decodeSharePayload,
  deriveSharedDocId,
  encodeSharePayload,
  sanitizeSharedViewState,
} from "./share";

function makePayload(over?: Partial<SharePayloadV1["doc"]>): SharePayloadV1 {
  return {
    v: 1,
    doc: {
      name: "テスト用ドキュメント 🚀",
      format: "json",
      json_string: `{"a": {"inner": {"x": 1}}, "b": [1, 2, 3], "c": "日本語と絵文字🎉と\\"escape\\""}`,
      ...over,
    },
    view: {
      narrowedFroms: [0, 1],
      foldedIndexes: [3, 5],
      query: ".items.*.status",
      queryMode: "advanced",
      resultAppearance: "lightup",
      showSearchPanel: true,
    },
  };
}

async function expectDecodeError(fragment: string, kind: ShareDecodeError["kind"]) {
  try {
    await decodeSharePayload(fragment);
    expect.unreachable(`should throw (kind=${kind})`);
  } catch (e) {
    expect(e).toBeInstanceOf(ShareDecodeError);
    expect((e as ShareDecodeError).kind).toBe(kind);
  }
}

async function gzipBase64url(text: string): Promise<string> {
  const stream = new Blob([new TextEncoder().encode(text)]).stream()
    .pipeThrough(new CompressionStream("gzip"));
  const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
  let bin = "";
  for (let i = 0; i < bytes.length; i++) { bin += String.fromCharCode(bytes[i]); }
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

describe("encodeSharePayload / decodeSharePayload", () => {
  it("json ドキュメントのラウンドトリップ", async () => {
    const payload = makePayload();
    const encoded = await encodeSharePayload(payload);
    expect(encoded.startsWith(SHARE_FRAGMENT_PREFIX)).toBe(true);
    const decoded = await decodeSharePayload(encoded);
    expect(decoded).toEqual(payload);
  });

  it("jsonl ドキュメントのラウンドトリップ", async () => {
    const payload = makePayload({ format: "jsonl", json_string: `{"a":1}\n{"a":2}\n` });
    const decoded = await decodeSharePayload(await encodeSharePayload(payload));
    expect(decoded).toEqual(payload);
  });

  it("先頭の # が付いたままでもデコードできる", async () => {
    const payload = makePayload();
    const decoded = await decodeSharePayload("#" + await encodeSharePayload(payload));
    expect(decoded).toEqual(payload);
  });

  it("数百KB級の JSON をラウンドトリップできる", async () => {
    const bigArray = [];
    for (let i = 0; i < 3000; i++) {
      bigArray.push({ id: i, status: i % 3 === 0 ? "active" : "inactive", note: `row-${i} のメモ`, tags: ["a", "b", "c"] });
    }
    const payload = makePayload({ json_string: JSON.stringify({ items: bigArray }) });
    expect(payload.doc.json_string.length).toBeGreaterThan(200_000);
    const encoded = await encodeSharePayload(payload);
    // gzip が効いて元よりだいぶ小さくなるはず
    expect(encoded.length).toBeLessThan(payload.doc.json_string.length);
    const decoded = await decodeSharePayload(encoded);
    expect(decoded).toEqual(payload);
  });

  it("% エンコードされたフラグメントを復元する", async () => {
    const payload = makePayload();
    const encoded = await encodeSharePayload(payload);
    const mangled = encoded.replace(/\./g, "%2E").replace(/-/g, "%2D");
    const decoded = await decodeSharePayload(mangled);
    expect(decoded).toEqual(payload);
  });

  it("異常系: 空フラグメント", async () => {
    await expectDecodeError("", "empty");
    await expectDecodeError("#", "empty");
  });

  it("異常系: プレフィックス欠落・未知プレフィックス", async () => {
    await expectDecodeError("zzzz", "base64");
    await expectDecodeError("j9.AAAA", "version");
  });

  it("異常系: base64 破壊", async () => {
    await expectDecodeError("j1.!!!!", "base64");
    await expectDecodeError("j1.AAAAA", "base64"); // 長さ mod 4 == 1 は base64 として不正
  });

  it("異常系: gzip 破壊", async () => {
    // 有効な base64url だが gzip ではないバイト列
    const notGzip = btoa("this is not gzip data").replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    await expectDecodeError(SHARE_FRAGMENT_PREFIX + notGzip, "gunzip");
  });

  it("異常系: JSON 破壊", async () => {
    await expectDecodeError(SHARE_FRAGMENT_PREFIX + await gzipBase64url("{ not json"), "json");
  });

  it("異常系: v:2 は version エラー", async () => {
    const p = { ...makePayload(), v: 2 };
    await expectDecodeError(await encodeSharePayload(p as unknown as SharePayloadV1), "version");
  });

  it("異常系: スキーマ不正", async () => {
    await expectDecodeError(SHARE_FRAGMENT_PREFIX + await gzipBase64url(`{"v":1,"doc":{}}`), "schema");
    await expectDecodeError(SHARE_FRAGMENT_PREFIX + await gzipBase64url(`{"v":1}`), "schema");
    const noView = { v: 1, doc: makePayload().doc };
    await expectDecodeError(SHARE_FRAGMENT_PREFIX + await gzipBase64url(JSON.stringify(noView)), "schema");
  });
});

describe("deriveSharedDocId", () => {
  it("同一 doc からは同一 id が導出される", async () => {
    const id1 = await deriveSharedDocId(makePayload().doc);
    const id2 = await deriveSharedDocId(makePayload().doc);
    expect(id1).toBe(id2);
    expect(id1).toMatch(/^shared-[0-9a-f]{32}$/);
  });

  it("本文が 1 文字違えば別 id になる", async () => {
    const base = makePayload().doc;
    const id1 = await deriveSharedDocId(base);
    const id2 = await deriveSharedDocId({ ...base, json_string: base.json_string + " " });
    expect(id1).not.toBe(id2);
  });
});

describe("buildShareUrl", () => {
  it("shared ルート + フラグメントを組み立てる", () => {
    expect(buildShareUrl("https://jet.example.com", "j1.abc")).toBe("https://jet.example.com/shared#j1.abc");
  });
});

describe("sanitizeSharedViewState", () => {
  const json = {
    a: { inner: { x: 1, y: 2 } },
    b: [10, 20, 30],
    c: "leaf",
  };
  const { items } = flattenJson(json, JSON.stringify(json));
  const indexOf = (elementKey: string) => {
    const found = items.filter((it) => it.elementKey === elementKey);
    expect(found.length).toBe(1);
    return found[0].index;
  };
  const baseView = {
    narrowedFroms: [] as number[],
    foldedIndexes: [] as number[],
    query: "",
    queryMode: "simple" as const,
    resultAppearance: "lightup" as const,
    showSearchPanel: false,
  };

  it("ナローイングの to を再導出する", () => {
    const s = sanitizeSharedViewState({ ...baseView, narrowedFroms: [indexOf("a")] }, items);
    expect(s.narrowedRanges).toEqual([{ from: indexOf("a"), to: indexOf("b") }]);
  });

  it("ネストした正常なナローイングは全段採用される", () => {
    const s = sanitizeSharedViewState(
      { ...baseView, narrowedFroms: [indexOf("a"), indexOf("a.inner")] },
      items,
    );
    expect(s.narrowedRanges.length).toBe(2);
    expect(s.narrowedRanges[1].from).toBe(indexOf("a.inner"));
  });

  it("範囲外の from は捨てられる", () => {
    const s = sanitizeSharedViewState({ ...baseView, narrowedFroms: [9999] }, items);
    expect(s.narrowedRanges).toEqual([]);
  });

  it("ネスト違反が出た段からは積まない (prefix 採用)", () => {
    const s = sanitizeSharedViewState(
      { ...baseView, narrowedFroms: [indexOf("a"), indexOf("b")] },
      items,
    );
    expect(s.narrowedRanges.length).toBe(1);
    expect(s.narrowedRanges[0].from).toBe(indexOf("a"));
  });

  it("葉ノードや範囲外の fold は除外される", () => {
    const s = sanitizeSharedViewState(
      { ...baseView, foldedIndexes: [indexOf("c"), indexOf("a"), 9999, -1, 1.5] },
      items,
    );
    expect(s.toggleState).toEqual({ [indexOf("a")]: true });
  });

  it("enum 外の queryMode / resultAppearance は既定値に落ちる", () => {
    const s = sanitizeSharedViewState(
      {
        ...baseView,
        queryMode: "weird" as unknown as "simple",
        resultAppearance: "sparkle" as unknown as "lightup",
      },
      items,
    );
    expect(s.queryMode).toBe("simple");
    expect(s.resultAppearance).toBe("lightup");
  });

  it("クエリは上限長でトリムされる", () => {
    const s = sanitizeSharedViewState({ ...baseView, query: "q".repeat(20_000) }, items);
    expect(s.query.length).toBe(10_000);
  });
});
