import { useJSON } from "@/states";
import { FlatJsonRow } from "./json/FlatJsonRow";
import { FixedSizeList } from "react-window";
import AutoSizer from 'react-virtualized-auto-sizer';
import _ from "lodash";
import { FooterBar } from "./lv3/FooterBar";
import { MutableRefObject, useRef } from "react";
import { FaRegFrown, FaRegMehBlank, FaRegMehRollingEyes, FaRegSadTear } from 'react-icons/fa';
import { useVisibleItems } from "@/states/json";
import { HeaderBar } from "./lv3/HeaderBar";
import { useManipulation } from "@/states/manipulation";
import { QueryView } from "./query/QueryView";
import { useEditJson } from "@/states/modal";

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
      {({ height, width }: { height: number; width: number; }) => (
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
  const { json } = useJSON();
  const visibles = useVisibleItems();
  const { openModal  } = useEditJson();

  if (!json) {
    return null;
  }

  if (json.status !== "accepted") {
    return <div
      className="h-full shrink grow gap-2 flex flex-col justify-center items-center cursor-pointer"
      onClick={() => openModal()}
    >
      <FaRegFrown className="text-4xl" />
      <p className="text-xl">I have an Invalid Data.</p>
    </div>
  }

  if (!visibles) {
    return <div
      className="h-full shrink grow gap-2 flex flex-col justify-center items-center"
    >
      <FaRegMehRollingEyes className="text-4xl" />
      <p className="text-xl">No Visible Items.</p>
    </div>
  }

  const { visibleItems, gauge } = visibles;
  return (
    <VirtualScroll
      itemViewRef={props.itemViewRef}
      data={visibleItems} // データ
      renderItem={(item) => <FlatJsonRow key={item.elementKey} item={item} gauge={gauge} />}
      itemSize={32} // 各アイテムの高さ
    />
  );
}

export const Main = () => {
  const { filteringPreference } = useManipulation();
  const itemViewRef = useRef<any>(null);

  return (<div
    className="shrink grow flex flex-col"
  >
    <div
      className='shrink-0 grow-0 flex flex-col'>
      <HeaderBar itemViewRef={itemViewRef} />
    </div>

    <div
      className="shrink grow flex flex-row"
    >

      {
        filteringPreference.showPanel
          ? <div
              className="shrink-0 grow-0 w-96 flex flex-col justify-stretch"
            >
              <QueryView />
            </div>
          : null
      }

      <div
        className="shrink grow"
      >
        <JsonItemsView itemViewRef={itemViewRef}/>
      </div>

    </div>

    <div
      className="shrink-0 grow-0 flex flex-col"
    >
      <FooterBar itemViewRef={itemViewRef} />
    </div>
  </div>)
};
