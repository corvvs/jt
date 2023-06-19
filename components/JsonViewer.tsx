import { useJSON } from "@/states";
import { FlatJsonRow, VirtualScroll } from "./json/FlatJsonRow";
import { JsonRowItem, JsonStats } from "@/libs/jetson";
import { useToggleState } from "@/states/view";
import { useManipulation } from "@/states/manipulation";
import _ from "lodash";

const JsonStatsLine = (props: {
  stats: JsonStats;
}) => {
  const { manipulation } = useManipulation();
  return (<>
    <p>
      Lines: {props.stats.item_count}
    </p>
    <p>
      Depth: {props.stats.max_depth}
    </p>
    <p>
      Characters: {props.stats.char_count}
    </p>
    {
      _.isFinite(manipulation.selectedIndex)
        ? <p>Selected: {manipulation.selectedIndex}</p>
        : null
    }
  </>)
};


const JsonItemsView = (props: {
  items: JsonRowItem[]
}) => {
  const { items } = props;
  const { toggleState } = useToggleState();
  // 表示すべきitemを選別する
  const visibleItems = items.filter((item) => !item.rowItems.some((rowItem) => toggleState[rowItem.index]));

  return (
    <VirtualScroll
      data={visibleItems} // データ
      renderItem={(item, index) => <FlatJsonRow
          key={item.elementKey}
          item={item}
          index={index}
        />
      }
      itemSize={32} // 各アイテムの高さ
    />
  );
}

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
        <JsonItemsView items={items} />
      </div>
      <div
        className="shrink-0 grow-0 flex flex-row gap-4 px-2 py-1 text-sm border-t-2 stats"
      >
        <JsonStatsLine stats={stats} />
      </div>
    </div>
  )
};
