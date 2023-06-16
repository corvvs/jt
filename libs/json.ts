import _ from "lodash";

type JSONPrimitiveValue = string | number | boolean | null;
type JSONStructuralValue = { [key: string]: JSONValue } | JSONValue[];
type JSONValue = JSONPrimitiveValue | JSONStructuralValue;

const JSONPrimitiveValueTypes = ["string", "number", "boolean", "null"] as const;
type JSONPrimitiveValueType = typeof JSONPrimitiveValueTypes[number];
const JSONStructuralValueTypes = ["object", "array"] as const;
type JSONStructuralValueType = typeof JSONStructuralValueTypes[number];
export const JSONValueTypes = [...JSONPrimitiveValueTypes, ...JSONStructuralValueTypes] as const;
export type JSONValueType = typeof JSONValueTypes[number];

export type JSONStringValueStruct = {
  typename: "string";
  value: string;
};
export type JSONNumberValueStruct = {
  typename: "number";
  value: number;
};
export type JSONBooleanValueStruct = {
  typename: "boolean";
  value: boolean;
};
export type JSONNullValueStruct = {
  typename: "null";
  value: null;
};
export type JSONObjectValueStruct = {
  typename: "object";
  value: { [key: string]: JSONValue };
  subtree: Array<[string, JSONValueStruct]>;
};
export type JSONArrayValueStruct = {
  typename: "array";
  value: JSONValue[];
  subarray: Array<JSONValueStruct>;
};

export type JSONValueStruct = JSONStringValueStruct | JSONNumberValueStruct | JSONBooleanValueStruct | JSONNullValueStruct | JSONObjectValueStruct | JSONArrayValueStruct;

export function structurizeJSON(json: any): JSONValueStruct {
  if (_.isNull(json)) {
    return {
      typename: "null",
      value: json,
    };
  }

  if (_.isString(json)) {
    return {
      typename: "string",
      value: json,
    };
  }
  if (_.isNumber(json)) {
    return {
      typename: "number",
      value: json,
    };
  }
  if (_.isBoolean(json)) {
    return {
      typename: "boolean",
      value: json,
    };
  }
  if (_.isArray(json)) {
    return {
      typename: "array",
      value: json,
      subarray: json.map((value) => structurizeJSON(value)),
    };
  }
  if (typeof json === "object") {
    return {
      typename: "object",
      value: json,
      subtree: _.map(json, (value, key) => [key, structurizeJSON(value)]),
    };
  }
  throw new Error("unreachable");
}


export function jsonItemCount(json: JSONValueStruct) {
  switch (json.typename) {
    case "string":
    case "number":
    case "boolean":
    case "null":
      return null;
    case "array":
      return json.subarray.length;
    case "object":
      return json.subtree.length;
  }
}

type FlatParent = {
  key: string;
  parent: JSONObjectValueFlatStruct;
} | {
  index: number;
  parent: JSONArrayValueFlatStruct;
};
type ParentPart = {
  parent?: FlatParent;
};

export type JSONStringValueFlatStruct = JSONStringValueStruct & ParentPart;
export type JSONNumberValueFlatStruct = JSONNumberValueStruct & ParentPart;
export type JSONBooleanValueFlatStruct = JSONBooleanValueStruct & ParentPart;
export type JSONNullValueFlatStruct = JSONNullValueStruct & ParentPart;
export type JSONObjectValueFlatStruct = JSONObjectValueStruct & ParentPart;
export type JSONArrayValueFlatStruct = JSONArrayValueStruct & ParentPart;

export type JSONValueFlatStruct = JSONStringValueFlatStruct | JSONNumberValueFlatStruct | JSONBooleanValueFlatStruct | JSONNullValueFlatStruct | JSONObjectValueFlatStruct | JSONArrayValueFlatStruct;

function flattenSingle(json: JSONValueStruct, parent?: FlatParent): JSONValueFlatStruct {
  switch (json.typename) {
    case "string": return {
      typename: "string",
      value: json.value,
      parent,
    };
    case "number": return {
      typename: "number",
      value: json.value,
      parent,
    };
    case "boolean": return {
      typename: "boolean",
      value: json.value,
      parent,
    };
    case "null": return {
      typename: "null",
      value: null,
      parent,
    }
    case "array": return {
      typename: "array",
      value: json.value,
      subarray: json.subarray,
      parent,
    };
    case "object": return {
      typename: "object",
      value: json.value,
      subtree: json.subtree,
      parent,
    };
  }
}

export function flattenJson(json: JSONValueStruct, context?: {
  parent: FlatParent;
  flattened: JSONValueFlatStruct[];
}) {
  const flattened = context?.flattened ?? [];
  const o = flattenSingle(json, context?.parent);
  flattened.push(o);
  switch (json.typename) {
    case "array": {
      _.each(json.subarray, (value, index) => {
        const parent: FlatParent = {
          parent: o as JSONArrayValueFlatStruct,
          index,
        };
        flattenJson(value, { parent, flattened });
      });
      break;
    }
    case "object": {
      _.each(json.subtree, ([key, value]) => {
        const parent: FlatParent = {
          parent: o as JSONObjectValueFlatStruct,
          key,
        };
        flattenJson(value, { parent, flattened });
      });
    }
  }
  return flattened;
}
