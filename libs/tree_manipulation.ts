import _ from "lodash";

/**
 * 受け取ったJSON文字列のうち, Mapについてのみキーでソートして返す
 * (jq --sort-keys と思ってよい)
 */
export function sortKeysJson(jsonText: string, parseJson: (text: string) => any ): string {
  const parsed = parseJson(jsonText);
  const stringified = recursiveRestringify(parsed);
  return stringified;
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
