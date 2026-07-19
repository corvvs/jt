import { JsonValueObject } from "./jetson";

export type JsonValueType = JsonValueObject["type"];

/**
 * ユニーク値の追跡上限. 種類数がこれを超えたら追跡を打ち切り capped を立てる.
 */
export const UNIQUE_VALUE_CAP = 100;

/**
 * ユニーク値として追跡する文字列の長さ上限.
 * これを超える文字列はメモリ保護のため追跡せず, skippedLongStrings に計上する.
 */
export const UNIQUE_STRING_MAX_LENGTH = 256;

/**
 * スキーマ木のノード.
 * JSON 構造を「配列の全要素をキー "*" にマージした」木に畳み込んだもので,
 * 1ノード = 1キーパスパターン (例: items.*.status) に対応し, そのパターンに
 * 合致した全ての値の統計を保持する.
 */
export type ProfileNode = {
  /**
   * 親の中でのキー名. 配列要素は "*", ルートは呼び出し元が与えたキー (既定は "")
   */
  key: string;
  /**
   * このパターンに合致した値の総数
   */
  total: number;
  /**
   * 型ごとの出現数
   */
  typeCounts: Partial<Record<JsonValueType, number>>;
  /**
   * map のキー + 配列の "*". 挿入順 = 初出順
   */
  children?: Map<string, ProfileNode>;
  numberStats?: { min: number; max: number };
  booleanStats?: { trueCount: number; falseCount: number };
  /**
   * 値 (JSON 表現の文字列) → 出現数.
   * capped が真なら途中で新しい値の追跡を打ち切っており, counts は完全ではない.
   */
  uniqueValues?: { counts: Map<string, number>; capped: boolean };
  /**
   * 長すぎてユニーク値として追跡しなかった文字列の数
   */
  skippedLongStrings?: number;
};

function createNode(key: string): ProfileNode {
  return { key, total: 0, typeCounts: {} };
}

function childOf(node: ProfileNode, key: string): ProfileNode {
  if (!node.children) {
    node.children = new Map();
  }
  let child = node.children.get(key);
  if (!child) {
    child = createNode(key);
    node.children.set(key, child);
  }
  return child;
}

function recordUniqueValue(node: ProfileNode, jsonLiteral: string) {
  if (!node.uniqueValues) {
    node.uniqueValues = { counts: new Map(), capped: false };
  }
  const unique = node.uniqueValues;
  const current = unique.counts.get(jsonLiteral);
  if (typeof current !== "undefined") {
    unique.counts.set(jsonLiteral, current + 1);
  } else if (unique.counts.size < UNIQUE_VALUE_CAP) {
    unique.counts.set(jsonLiteral, 1);
  } else {
    unique.capped = true;
  }
}

function addValue(node: ProfileNode, vo: JsonValueObject) {
  node.total += 1;
  node.typeCounts[vo.type] = (node.typeCounts[vo.type] ?? 0) + 1;

  switch (vo.type) {
    case "number": {
      if (!node.numberStats) {
        node.numberStats = { min: vo.value, max: vo.value };
      } else {
        if (vo.value < node.numberStats.min) {
          node.numberStats.min = vo.value;
        }
        if (node.numberStats.max < vo.value) {
          node.numberStats.max = vo.value;
        }
      }
      recordUniqueValue(node, JSON.stringify(vo.value));
      break;
    }
    case "string": {
      if (vo.value.length <= UNIQUE_STRING_MAX_LENGTH) {
        recordUniqueValue(node, JSON.stringify(vo.value));
      } else {
        node.skippedLongStrings = (node.skippedLongStrings ?? 0) + 1;
      }
      break;
    }
    case "boolean": {
      if (!node.booleanStats) {
        node.booleanStats = { trueCount: 0, falseCount: 0 };
      }
      if (vo.value) {
        node.booleanStats.trueCount += 1;
      } else {
        node.booleanStats.falseCount += 1;
      }
      break;
    }
    case "null": {
      break;
    }
    case "array": {
      if (vo.value.length > 0) {
        const child = childOf(node, "*");
        for (const element of vo.value) {
          addValue(child, element);
        }
      }
      break;
    }
    case "map": {
      for (const itemKey of Object.keys(vo.value)) {
        addValue(childOf(node, itemKey), vo.value[itemKey]);
      }
      break;
    }
  }
}

/**
 * VO ツリーを走査してスキーマ木 (統計つき) を作る.
 */
export function profileJson(
  vo: JsonValueObject,
  rootKey: string = "",
): ProfileNode {
  const root = createNode(rootKey);
  addValue(root, vo);
  return root;
}

export function nullRate(node: ProfileNode): number {
  return node.total > 0 ? (node.typeCounts.null ?? 0) / node.total : 0;
}

/**
 * map の子キーの出現率 (親が map として出現した回数に対する割合)
 */
export function keyOccurrenceRate(
  parent: ProfileNode,
  child: ProfileNode,
): number {
  const mapCount = parent.typeCounts.map ?? 0;
  return mapCount > 0 ? child.total / mapCount : 0;
}

/**
 * ユニーク値を出現数の降順で返す
 */
export function uniqueValueEntries(node: ProfileNode): [string, number][] {
  if (!node.uniqueValues) {
    return [];
  }
  return Array.from(node.uniqueValues.counts.entries()).sort(
    (a, b) => b[1] - a[1],
  );
}

const SchemaTypeNames: Record<JsonValueType, string> = {
  string: "string",
  number: "number",
  boolean: "boolean",
  null: "null",
  array: "array",
  map: "object",
};

/**
 * スキーマ木を JSON Schema (draft-07) 相当のオブジェクトに変換する.
 * required は「map として出現した全てのインスタンスに存在したキー」のみ.
 */
export function toJsonSchema(node: ProfileNode): any {
  const types = (Object.keys(node.typeCounts) as JsonValueType[])
    .map((t) => SchemaTypeNames[t])
    .sort();
  const schema: any = {};
  if (types.length === 1) {
    schema.type = types[0];
  } else if (types.length > 1) {
    schema.type = types;
  }

  const mapCount = node.typeCounts.map ?? 0;
  if (mapCount > 0) {
    const properties: { [key: string]: any } = {};
    const required: string[] = [];
    node.children?.forEach((child, key) => {
      if (key === "*") {
        return;
      }
      properties[key] = toJsonSchema(child);
      if (child.total === mapCount) {
        required.push(key);
      }
    });
    if (Object.keys(properties).length > 0) {
      schema.properties = properties;
    }
    if (required.length > 0) {
      schema.required = required;
    }
  }

  if ((node.typeCounts.array ?? 0) > 0) {
    const element = node.children?.get("*");
    if (element) {
      schema.items = toJsonSchema(element);
    }
  }

  return schema;
}

/**
 * ルート用: $schema をつけた JSON Schema ドキュメントにする
 */
export function toJsonSchemaDocument(node: ProfileNode): any {
  return {
    $schema: "http://json-schema.org/draft-07/schema#",
    ...toJsonSchema(node),
  };
}
