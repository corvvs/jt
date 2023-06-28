import React, { MutableRefObject, useState } from "react";
import { VscEdit } from 'react-icons/vsc';
import { InlineIcon } from "@/components/lv1/InlineIcon";
import { Modal } from "@/components/Modal";
import { EditJsonCard } from "@/components/json/EditJsonCard";
import { MenuButton, MenuToggleButton } from "@/components/lv1/MenuButton";
import { HiChevronDoubleDown, HiChevronDoubleUp } from "react-icons/hi";
import { useToggleMass } from "@/states/view";
import { useJSON } from "@/states";
import { usePreference } from "@/states/preference";
import { useManipulation } from "@/states/manipulation";
import { SimpleFilterPanel } from "../lv2/SimpleFilterPanel";
import { FaChevronRight } from "react-icons/fa";
import _ from "lodash";
import { AdvancedFilterPanel } from "../lv2/AdvancedFilterPanel";

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

const MassManipulationButtons = () => {
  const { flatJsons } = useJSON();
  const { openAll, closeAll } = useToggleMass();
  const { preference, setPreference } = usePreference();
  if (!flatJsons) { return null; }

  return <>

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

    { false &&
      <MenuToggleButton
        isToggled={preference.visible_subtree_stat}
        onClick={(isToggled) => setPreference((prev) => ({ ...prev, visible_subtree_stat: isToggled }))}
      >
        {preference.visible_subtree_stat ? "Hide" : "Show"} Subtree Stats
      </MenuToggleButton>
    }
  </>
}

const MainLine = () => {
  const [isOpen, setIsOpen] = useState(false);

  const closeModal = () => {
    setIsOpen(false);
  };

  const openModal = () => {
    setIsOpen(true);
  };

  return (<div
    className="shrink-0 grow-0 gap-2 flex flex-row items-center"
  >
    <Modal closeModal={closeModal} isOpen={isOpen}>
      <EditJsonCard closeModal={closeModal} />
    </Modal>

    <h2 className="px-2">JSON Analyzer(alpha)</h2>

    <div className='flex flex-row items-center gap-2'>
      <MenuButton
        onClick={() => openModal()}
      >
        <InlineIcon i={<VscEdit />} />Edit Text
      </MenuButton>

      <MassManipulationButtons />

      <AdvancedFilterPanel />
      {/* <SimpleFilterPanel /> */}

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