import { useJSON } from "@/states";
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
  )
};
