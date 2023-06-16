import { useJSON } from "@/states";
import { JsonStructure } from "./json/JsonStructure";
import { FlatJsonRow, VirtualScroll } from "./json/FlatJsonRow";

export const JsonViewer = () => {
  const { flatJsons }  = useJSON();

  if (!flatJsons) { return null; }
  return (
    <VirtualScroll
      data={flatJsons} // データ
      renderItem={(item, index) => <FlatJsonRow key={item.elementKey} item={item} />}
      itemSize={32} // 各アイテムの高さ
    />    

    // <div className='shrink grow font-mono text-sm overflow-scroll'>
    //   { flatJsons?.map(item => <FlatJsonRow key={item.elementKey} item={item} />) }
    // </div>
  )


  // return (
  //   <div className='shrink grow font-mono text-sm overflow-scroll'>
  //     { jsonStructure ? <JsonStructure js={jsonStructure} /> : null }
  //   </div>
  // )
};
