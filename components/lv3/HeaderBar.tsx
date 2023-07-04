import React, { MutableRefObject } from "react";
import { VscEdit, VscNewFile } from 'react-icons/vsc';
import { InlineIcon } from "@/components/lv1/InlineIcon";
import { MenuButton, MenuToggleButton } from "@/components/lv1/MenuButton";
import { HiChevronDoubleDown, HiChevronDoubleUp } from "react-icons/hi";
import { useToggleMass } from "@/states/view";
import { useJSON } from "@/states";
import { usePreference } from "@/states/preference";
import { useManipulation } from "@/states/manipulation";
import { FaChevronRight, FaSearch } from "react-icons/fa";
import _ from "lodash";
import { useEditJson } from "@/states/modal";
import Link from "next/link";

const NarrowingLine = (props: {
  itemViewRef: MutableRefObject<any>;
}) => {
  const { manipulation, popNarrowedRange } = useManipulation();
  const { flatJsons } = useJSON();
  if (!flatJsons) { return null; }
  if (manipulation.narrowedRanges.length === 0) { return null; }
  const allItems = flatJsons.items;
  const { stats } = flatJsons;

  let lastKeyPath = "";
  const narrowingItems = manipulation.narrowedRanges.map(range => {
    const item = allItems[range.from];
    const keyPath = (() => {
      if (item.elementKey.startsWith(lastKeyPath)) {
        return item.elementKey.substring(lastKeyPath ? lastKeyPath.length + 1 : 0);
      } else {
        // 本来はおかしい
        return item.elementKey;
      }
    })();
    lastKeyPath = item.elementKey;
    return {
      item,
      keyPath,
      range,
    };
  });

  return (<div
    className="narrowing-line shrink-0 grow-0 flex flex-row gap-1 text-sm stats items-center"
  >
    <p className="line-title shrink-0 grow-0">Narrowing</p>

    <p
      className="stats-item narrowing-status shrink-0 grow-0 cursor-pointer"
      onClick={() => popNarrowedRange()}
    >
      <span>(root)</span>
    </p>

    {
      narrowingItems.map((narrowingItem, i) => {
        return <React.Fragment key={narrowingItem.item.elementKey}>
          <p><FaChevronRight /></p>
          <p
            className="stats-item narrowing-status shrink-0 grow-0 cursor-pointer"
            onClick={() => {
              const itemView = props.itemViewRef.current
              if (!itemView) { return; }
              if (i + 1 === narrowingItems.length) {
                // ナローイングスタックの末尾 -> ただスクロールする
                itemView.scrollToItem(0);
              } else {
                // 末尾でない -> クリックした要素までスタックをpopする
                popNarrowedRange(i);
              }
            }}
          >
            <span>{narrowingItem.keyPath}</span>
          </p>
        </React.Fragment>;
      })
    }
  </div>)
}

const ManipulationButtons = () => {
  const { flatJsons } = useJSON();
  const { openAll, closeAll } = useToggleMass();
  const { preference, setPreference } = usePreference();
  const { filteringPreference, setFilteringBooleanPreference } = useManipulation();
  if (!flatJsons) { return null; }

  return <>

    <MenuToggleButton
      isToggled={filteringPreference.showPanel}
      onClick={(value) => setFilteringBooleanPreference("showPanel", value)}
    >
      <InlineIcon i={<FaSearch />} />
      Filter
    </MenuToggleButton>

    <MenuButton
      onClick={() => closeAll()}
    >
      <InlineIcon i={<HiChevronDoubleUp />} />
      Fold All
    </MenuButton>

    <MenuButton
      onClick={() => openAll()}
    >
      <InlineIcon i={<HiChevronDoubleDown />} />
      Unfold All
    </MenuButton>

  </>
}

const AppTitle = () => {
  return <h2
    className="px-2 whitespace-nowrap break-keep"
  >
    JSON Analyzer(alpha)
  </h2>
};

const MainLine = () => {
  const { openModal } = useEditJson();

  return (<div
    className="shrink-0 grow-0 gap-2 flex flex-row items-center"
  >
    <AppTitle />

    <div className='flex flex-row items-center gap-2'>
      <Link
        className="flippable h-[2.4em] flex flex-row items-center py-1 px-2 whitespace-nowrap break-keep"
        href="/new"
        target="_blank"
      >
        <InlineIcon i={<VscNewFile />} />
        New
      </Link>


      <MenuButton
        onClick={() => openModal()}
      >
        <InlineIcon i={<VscEdit />} />Edit Text
      </MenuButton>

      <ManipulationButtons />

    </div>
  </div>);
};

export const HeaderBar = (props: {
  itemViewRef: MutableRefObject<any>;
}) => {

  return (<>
    <MainLine />
    <NarrowingLine itemViewRef={props.itemViewRef} />
  </>);
};