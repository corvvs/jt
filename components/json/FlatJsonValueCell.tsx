import { JsonValueObject, JsonValueObjectBoolean, JsonValueObjectNull, JsonValueObjectNumber, JsonValueObjectString } from "@/libs/jetson";
import { MdDataArray, MdDataObject } from 'react-icons/md';
import { BsToggleOff, BsToggleOn } from 'react-icons/bs';
import { TiSortAlphabetically, TiSortNumerically } from 'react-icons/ti';
import _ from "lodash";

const IconString = TiSortAlphabetically;
const IconNumber = TiSortNumerically;
const IconTrue = BsToggleOn;
const IconFalse = BsToggleOff;
const IconMap = MdDataObject;
const IconArray = MdDataArray;

export const ActualIconForType = (props: {
  vo: JsonValueObject;
}) => {
  switch (props.vo.type) {
    case "string":
      return <IconString />;
    case "number":
      return <IconNumber />;
    case "boolean":
      if (props.vo.value) {
        return <IconTrue />;
      } else {
        return <IconFalse />;
      }
    case "map":
      return <IconMap />;
    case "array":
      return <IconArray />;
  }
  return null;
};

const ValueStringCell = (props: {
  vo: JsonValueObjectString
  elementKey: string;
  matched?: boolean;
}) => {
  return <div
    className="json-structure item-value json-string-structure p-1 flex items-center"
    title={props.elementKey}
  >
    <p>&quot;{props.vo.value}&quot;</p>
  </div>;
}

const ValueNumberCell = (props: {
  vo: JsonValueObjectNumber
  elementKey: string;
  matched?: boolean;
}) => {
  return <div
    className="json-structure item-value json-number-structure p-1 flex items-center"
    title={props.elementKey}
  >
    <p>{props.vo.value}</p>
  </div>;
}

const ValueBooleanCell = (props: {
  vo: JsonValueObjectBoolean
  elementKey: string;
  matched?: boolean;
}) => {
  return <div
    className="json-structure item-value json-boolean-structure p-1 flex items-center"
    title={props.elementKey}
  >
    <p>
      {
        props.vo.value
          ? <span className="value-true">True</span>
          : <span className="value-false">False</span>
      }
    </p>
  </div>;
}

const ValueNullCell = (props: {
  vo: JsonValueObjectNull
  elementKey: string;
  matched?: boolean;
}) => {
  return <div
    className="json-structure item-value json-null-structure p-1"
    title={props.elementKey}
  >
    <p>(null)</p>
  </div>;
}

export const FlatJsonValueCell = (props: {
  vo: JsonValueObject;
  elementKey: string;
  matched?: boolean;
}) => {
  switch (props.vo.type) {
    case "string":
      return <ValueStringCell vo={props.vo} elementKey={props.elementKey} matched={props.matched} />;
    case "number":
      return <ValueNumberCell vo={props.vo} elementKey={props.elementKey} matched={props.matched} />;
    case "boolean":
      return <ValueBooleanCell vo={props.vo} elementKey={props.elementKey} matched={props.matched} />;
    case "null":
      return <ValueNullCell vo={props.vo} elementKey={props.elementKey} matched={props.matched} />;
    default:
      return null;
  }
}
