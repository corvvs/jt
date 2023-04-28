import { useJSON } from "@/states";
import { JsonStructure } from "./json/JsonStructure";

export const JsonViewer = () => {
  const { jsonStructure }  = useJSON();
  return (
    <div className='shrink grow font-mono text-sm overflow-scroll'>
      { jsonStructure ? <JsonStructure js={jsonStructure} /> : null }
    </div>
  )
};
