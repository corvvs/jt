import { useJSON } from "@/states";
import { FlatJsonRow } from "./json/FlatJsonRow";
import { JsonRowItem } from "@/libs/jetson";
import { useToggleState } from "@/states/view";
import { useManipulation } from "@/states/manipulation";
import { FixedSizeList } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import _ from "lodash";
import { JsonStatsLines } from "./lv3/FooterBar";
import { MutableRefObject, useRef } from "react";
import { FaRegMehRollingEyes } from 'react-icons/fa';
import { useVisibleItems } from "@/states/json";

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
  itemViewRef: MutableRefObject<any>;
}) => {
  const visibleItems = useVisibleItems();

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
      renderItem={(item) => <FlatJsonRow key={item.elementKey} item={item} />}
      itemSize={32} // 各アイテムの高さ
    />
  );
}

export const JsonViewer = () => {
  const { flatJsons }  = useJSON();
  const itemViewRef = useRef<any>(null);

  if (!flatJsons) { return null; }
  const {
    stats,
  } = flatJsons;
  return (<div
      className="shrink grow flex flex-col"
    >
      <div
        className="shrink grow"
      >
        <JsonItemsView itemViewRef={itemViewRef}/>
      </div>

      <div
        className="shrink-0 grow-0 flex flex-col border-t-2"
      >
        <JsonStatsLines stats={stats} itemViewRef={itemViewRef} />
      </div>
    </div>
  )
};
