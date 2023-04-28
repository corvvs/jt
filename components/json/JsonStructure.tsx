import { JSONArrayValueStruct, JSONBooleanValueStruct, JSONNullValueStruct, JSONNumberValueStruct, JSONObjectValueStruct, JSONStringValueStruct, JSONValueStruct, jsonItemCount } from "@/libs/json"
import React from "react";
import { MdDataArray, MdDataObject } from 'react-icons/md';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { TiSortAlphabetically, TiSortNumerically } from 'react-icons/ti';
import { InlineIcon } from "../lv1/InlineIcon";
import _ from "lodash";


const IconString = TiSortAlphabetically;
const IconNumber = TiSortNumerically;
const IconTrue = BsToggleOn;
const IconFalse = BsToggleOff;
const IconObject = MdDataObject;
const IconArray = MdDataArray;


const ActualIconForType = (props: {
  json: JSONValueStruct;
}) => {
  switch (props.json.typename) {
    case "string":
      return IconString;
    case "number":
      return IconNumber;
    case "boolean":
      if (props.json.value) {
        return IconTrue;
      } else {
        return IconFalse;
      }
    case "object":
      return IconObject;
    case "array":
      return IconArray;
    default:
      return null;
  }
};

const IconForType = (props: {
  json: JSONValueStruct;
}) => {
  const Icon = ActualIconForType(props);
  if (!Icon) { return null; }
  return <InlineIcon className="text-xl" i={<Icon className="text-xl" />} />
}

const JsonNullStructure = (props: {
  jkey?: string;
  js: JSONNullValueStruct;
}) => {
  return (<div className="json-structure json-null-structure">
    <p className="value-null">(null)</p>
  </div>);
}

const JsonStringStructure = (props: {
  jkey?: string;
  js: JSONStringValueStruct;
}) => {
  return (<div className="json-structure json-string-structure flex items-center">
    <p className="item-value">
      &quot;{props.js.value}&quot;
    </p>
  </div>);
}

const JsonNumberStructure = (props: {
  jkey?: string;
  js: JSONNumberValueStruct;
}) => {
  return (<div className="json-structure json-number-structure flex items-center">
    <p className="item-value">
      {props.js.value}
    </p>
  </div>);
}

const JsonBooleanStructure = (props: {
  jkey?: string;
  js: JSONBooleanValueStruct;
}) => {
  return (<div className="json-structure json-boolean-structure flex items-center">
    <p className="item-value">
      {props.js.value
        ? <span className="value-true">True</span>
        : <span className="value-false">False</span>}
    </p>
  </div>);
}

const JsonObjectStructure = (props: {
  jkey?: string;
  js: JSONObjectValueStruct;
}) => {
  return (<div className="json-structure json-object-structure grid grid-cols-[max-content_1fr] justify-stretch">
    <p className="schema-key">
      <span className="p-1">key</span>
    </p>
    <p className="schema-value">
      <span className="p-1">value</span>
    </p>
    {props.js.subtree.map((v) => {
      const [k, value] = v;
      const key = `${props.jkey ? props.jkey + "." : ""}${k}`;
      const is_structural = value.typename === "object" || value.typename === "array";
      const keyClassName = is_structural ? "item-key flex items-start" : "item-key flex items-center";
      const itemCount = jsonItemCount(value);
      return (
        <React.Fragment key={key}>
          <div className={keyClassName}>
            <div className="sticky top-0 flex items-center">
              {is_structural ? null : <IconForType json={value} /> }
              <p className="key max-w-[10em] text-ellipsis whitespace-nowrap overflow-hidden p-1">{k}</p>
              {is_structural ? <IconForType json={value} /> : null }
              { _.isFinite(itemCount) ? <p className="p-1">({itemCount})</p> : null }
            </div>
          </div>
          <div className="item-value flex items-center pl-1">
            <JsonStructure jkey={key} js={value} />
          </div>
        </React.Fragment>
      );
    })}
  </div>);
}

const JsonArrayStructure = (props: {
  jkey?: string;
  js: JSONArrayValueStruct;
}) => {
  return (<div className="json-structure json-array-structure grid grid-cols-[max-content_1fr] justify-stretch">
    <p className="schema-index">
      <span className="p-1">idx</span>
    </p>
    <p className="schema-count">
    </p>

    {props.js.subarray.map((v, i) => {
      const key = `${props.jkey ? props.jkey + "." : ""}${i}`;
      const is_structural = v.typename === "object" || v.typename === "array";
      const keyClassName = is_structural ? "item-index flex items-start" : "item-index flex items-center";
      const itemCount = jsonItemCount(v);
      return (<React.Fragment key={key}>

        <div className={keyClassName}>
          <div className="sticky top-0 flex items-center">
            {is_structural ? null: <IconForType json={v} /> }
            <p className="index p-1 font-bold">#{i}</p>
            {is_structural ? <IconForType json={v} /> : null }
            { _.isFinite(itemCount) ? <p className="p-1">({itemCount})</p> : null }
          </div>
        </div>

        <div className="item-value flex items-center pl-1">
          <JsonStructure jkey={key} js={v} />
        </div>

      </React.Fragment>)
    })}
  </div>);
}

export const JsonStructure = (props: {
  jkey?: string;
  js: JSONValueStruct;
}) => {
  if (props.js.typename === "string") {
    return <JsonStringStructure jkey={props.jkey} js={props.js} />
  }
  if (props.js.typename === "number") {
    return <JsonNumberStructure jkey={props.jkey} js={props.js} />
  }
  if (props.js.typename === "boolean") {
    return <JsonBooleanStructure jkey={props.jkey} js={props.js} />
  }
  if (props.js.typename === "object") {
    return <JsonObjectStructure jkey={props.jkey} js={props.js} />
  }
  if (props.js.typename === "array") {
    return <JsonArrayStructure jkey={props.jkey} js={props.js} />
  }
  if (props.js.typename === "null") {
    return <JsonNullStructure jkey={props.jkey} js={props.js} />
  }
  return null;
};
