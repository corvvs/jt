import { useJSON } from "@/states";
import { FlatJsonRow } from "./json/FlatJsonRow";
import { JsonRowItem } from "@/libs/jetson";
import { useToggleState } from "@/states/view";
import { useManipulation } from "@/states/manipulation";
import { FixedSizeList } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import _ from "lodash";
import { JsonStatsLine } from "./lv3/FooterBar";
import { MutableRefObject, useRef } from "react";
import { FaRegMehRollingEyes } from 'react-icons/fa';

interface VirtualScrollProps<T> {
  data: T[];
  renderItem: (item: T, index: number) => JSX.Element;
  itemSize: number;
  itemViewRef: MutableRefObject<any>;
}

function VirtualScroll<T>({ data, renderItem, itemSize, itemViewRef }: VirtualScrollProps<T>) {
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
          ref={itemViewRef}
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
  items: JsonRowItem[];
  itemViewRef: MutableRefObject<any>;
}) => {
  const { items } = props;
  const { toggleState } = useToggleState();
  const { manipulation, simpleFilterMaps } = useManipulation();

  // 表示すべきitemを選別する
  const filterBySimpleFilteringQuery = simpleFilterMaps
    ? (item: JsonRowItem) => simpleFilterMaps.visible[item.index]
    : () => true;

  const filterByNarrowing = manipulation.narrowedRange
    ? (item: JsonRowItem) => {
        const { from, to } = manipulation.narrowedRange!;
        return from <= item.index && item.index < to;
      }
    : () => true;
  const visibleItems = (() => {
    return items
      .filter(filterByNarrowing)
      .filter(filterBySimpleFilteringQuery)
      .filter((item) => !item.rowItems.some((rowItem) => toggleState[rowItem.index]));
  })();

  if (visibleItems.length === 0) {
    return <div
      className="h-full shrink grow gap-2 flex flex-col justify-center items-center"
    >
      <FaRegMehRollingEyes className="text-4xl" />
      <p className="text-xl">no visible items</p>
    </div>
  }

  return (
    <VirtualScroll
      itemViewRef={props.itemViewRef}
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
  const itemViewRef = useRef<any>(null);

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
        <JsonItemsView items={items} itemViewRef={itemViewRef}/>
      </div>
      <div
        className="shrink-0 grow-0 flex flex-row gap-4 px-2 py-1 text-sm border-t-2 stats items-center"
      >
        <JsonStatsLine stats={stats} itemViewRef={itemViewRef} />
      </div>
    </div>
  )
};
