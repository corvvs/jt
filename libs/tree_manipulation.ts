import { DataFormat } from "@/states/config";
import _ from "lodash";

/**
 * 受け取ったJSON文字列のうち, Mapについてのみキーでソートして返す
 * (jq --sort-keys と思ってよい)
 */
export function sortKeysJson(dataFormat: DataFormat, jsonText: string, parseData: (dataFormat: DataFormat, text: string) => any ): string {
  const parsed = parseData(dataFormat, jsonText);
  switch (dataFormat) {
    case "jsonl": {
      return parsed.map((item: any) => recursiveRestringify(item)).join("\n");
    }
    case "json":
    default: {
      const stringified = recursiveRestringify(parsed);
      return stringified;
    }
  }
}

function recursiveRestringify(item: any): string {
  if (typeof item !== "object" || _.isNull(item)) {
    return JSON.stringify(item);
  }

  if (_.isArray(item)) {
    return `[${item.map((value) => recursiveRestringify(value)).join(", ")}]`;
  }

  const keys = _.sortBy(Object.keys(item), key => key);

  const stringified = keys.map((key) => {
    const value = item[key]!;
    const stringified = recursiveRestringify(value);
    return `\"${key}\": ${stringified}`;
  }).join(", ");
  return `{${stringified}}`;
}
