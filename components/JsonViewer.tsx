import { useJSON } from "@/states";
import { FlatJsonRow } from "./json/FlatJsonRow";
import { JsonRowItem, JsonStats } from "@/libs/jetson";
import { useToggleState } from "@/states/view";
import { useManipulation } from "@/states/manipulation";
import { FixedSizeList } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import _ from "lodash";

const JsonStatsLine = (props: {
  stats: JsonStats;
}) => {
  const { manipulation } = useManipulation();
  return (<>
    <p>
      <span>Lines:</span>
      <span className="stats-value">{props.stats.item_count}</span>
    </p>
    <p>
      <span>Depth:</span>
      <span className="stats-value">{props.stats.max_depth}</span>
    </p>
    <p>
      <span>Characters:</span>
      <span className="stats-value">{props.stats.char_count}</span>
    </p>
    {
      _.isFinite(manipulation.selectedIndex)
        ? <p>
            <span>Selected Line:</span>
            <span className="stats-value">{manipulation.selectedIndex}</span>
          </p>
        : null
    }
  </>)
};

interface VirtualScrollProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  itemSize: number;
}

function VirtualScroll<T>({ data, renderItem, itemSize }: VirtualScrollProps<T>) {
  const Row = ({ index, style }: any) => {
    return (
      <div style={style}>
        {renderItem(data[index], index)}
      </div>
    );
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <FixedSizeList
          height={height}
          width={width}
          itemCount={data.length}
          itemSize={itemSize}
          overscanCount={20}
        >
          {Row}
        </FixedSizeList>
      )}
    </AutoSizer>
  );
}

const JsonItemsView = (props: {
  items: JsonRowItem[]
}) => {
  const { items } = props;
  const { toggleState } = useToggleState();
  const { manipulation } = useManipulation();

  // 表示すべきitemを選別する
  const visibleItems = (() => {
    if (manipulation.narrowedRange) {
      const { from, to } = manipulation.narrowedRange;
      return items.filter((item) => from <= item.index && item.index < to && !item.rowItems.some((rowItem) => toggleState[rowItem.index]));
    }
    return items.filter((item) => !item.rowItems.some((rowItem) => toggleState[rowItem.index]));
  })();

  return (
    <VirtualScroll
      data={visibleItems} // データ
      renderItem={(item) => <FlatJsonRow
          key={item.elementKey}
          item={item}
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
