import { useJSON } from "@/states";
import { FlatJsonRow, VirtualScroll } from "./json/FlatJsonRow";

export const JsonViewer = () => {
  const { flatJsons }  = useJSON();

  if (!flatJsons) { return null; }
  const {
    items,
    stats,
  } = flatJsons;
  return (<div
      className="shrink grow flex flex-col"
    >
      <div
        className="shrink grow"
      >
        <VirtualScroll
          data={items} // データ
          renderItem={(item, index) => <FlatJsonRow key={item.elementKey} item={item} index={index} />}
          itemSize={32} // 各アイテムの高さ
        />
      </div>
      <div
        className="shrink-0 grow-0 flex flex-row gap-4 px-2 py-1 text-sm border-t-2 stats"
      >
        <p>
          Lines: {stats.item_count}
        </p>
        <p>
          Depth: {stats.max_depth}
        </p>
        <p>
          Characters: {stats.char_count}
        </p>
      </div>
    </div>
  )
};
