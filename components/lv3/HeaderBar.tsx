import React, { MutableRefObject } from "react";
import { VscEdit, VscNewFile } from 'react-icons/vsc';
import { InlineIcon } from "@/components/lv1/InlineIcon";
import { MenuButton, MenuToggleButton } from "@/components/lv1/MenuButton";
import { HiChevronDoubleDown, HiChevronDoubleUp } from "react-icons/hi";
import { useToggleMass } from "@/states/view";
import { useJSON } from "@/states";
import { useEffectiveItems } from "@/states/json";
import { useManipulation } from "@/states/manipulation";
import { FaChevronRight, FaList, FaSearch } from "react-icons/fa";
import _ from "lodash";
import { useEditJsonModal, useSelectDiffTargetModal } from "@/states/modal";
import { useDiffTarget } from "@/states/diff";
import { GoDiff } from "react-icons/go";
import { useRouter } from "next/router";
import Link from "next/link";
import { ThemeSelector } from "../lv2/ThemeSelector";
import { useTransientBackdrop } from "@/features/TransientBackdrop";

export type HeaderMode = 'json-viewer' | 'document-list';

const NarrowingLine = (props: {
  itemViewRef: MutableRefObject<any>;
}) => {
  const { manipulation, popNarrowedRange } = useManipulation();
  const flatJsons = useEffectiveItems();
  if (!flatJsons) { return null; }
  if (manipulation.narrowedRanges.length === 0) { return null; }
  const allItems = flatJsons.items;

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

const DiffLine = () => {
  const { diffTarget } = useDiffTarget();
  const { document } = useJSON();
  const router = useRouter();
  if (!diffTarget) { return null; }
  const [docId] = (router.query.docId || []) as string[];

  return (<div
    className="narrowing-line shrink-0 grow-0 flex flex-row gap-1 text-sm stats items-center"
  >
    <p className="line-title shrink-0 grow-0">Diff</p>

    <p className="stats-item shrink-0 grow-0">
      <span>old: {diffTarget.name || "無題のドキュメント"}</span>
    </p>

    <p><FaChevronRight /></p>

    <p className="stats-item shrink-0 grow-0">
      <span>new: {document?.name || "無題のドキュメント"}</span>
    </p>

    <p
      className="stats-item narrowing-status shrink-0 grow-0 cursor-pointer"
      onClick={() => router.push(`/${docId}`)}
    >
      <span>Exit</span>
    </p>
  </div>);
};

const OpetationButtons = (props: {
  mode: HeaderMode;
}) => {
  const { mode } = props;
  const { openModal: openEditDataModal } = useEditJsonModal();
  const { openModal: openSelectDiffTargetModal } = useSelectDiffTargetModal();
  const { flatJsons } = useJSON();
  const { unfoldAll, foldAll } = useToggleMass();
  const { filteringPreference, setFilteringBooleanPreference } = useManipulation();
  const {
    handleMouseEnter,
    handleMouseLeave,
    backdrop,
  } = useTransientBackdrop();

  return <div
    className='header-bar relative flex flex-row items-center gap-1'
    onMouseLeave={handleMouseLeave}
  >
    {backdrop}
    
    {mode === 'json-viewer' && (
      <Link
        className="flippable h-[2.4em] flex flex-row py-1 whitespace-nowrap break-keep"
        href="/_list"
        onMouseEnter={handleMouseEnter}
      >
        <InlineIcon i={<FaList />} />
        <span>List</span>
      </Link>
    )}

    <Link
      className="flippable h-[2.4em] flex flex-row py-1 whitespace-nowrap break-keep"
      href="/new"
      target="_blank"
      onMouseEnter={handleMouseEnter}
    >
      <InlineIcon i={<VscNewFile />} />
      <span>New</span>
    </Link>

    {mode === 'json-viewer' && (
      <MenuButton
        onClick={() => openEditDataModal()}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons}
      >
        <InlineIcon i={<VscEdit />} />
        <span>Edit</span>
      </MenuButton>
    )}

    {mode === 'json-viewer' && (
      <MenuToggleButton
        isToggled={filteringPreference.showPanel}
        onClick={(value) => setFilteringBooleanPreference("showPanel", value)}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons}
      >
        <InlineIcon i={<FaSearch />} />
        <span>Search</span>
      </MenuToggleButton>
    )}

    {mode === 'json-viewer' && (
      <MenuButton
        onClick={() => openSelectDiffTargetModal()}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons}
      >
        <InlineIcon i={<GoDiff />} />
        <span>Diff</span>
      </MenuButton>
    )}

    {mode === 'json-viewer' && (
      <MenuButton
        onClick={() => foldAll()}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons}
      >
        <InlineIcon i={<HiChevronDoubleUp />} />
        <span>Fold</span>
      </MenuButton>
    )}

    {mode === 'json-viewer' && (
      <MenuButton
        onClick={() => unfoldAll()}
        onMouseEnter={handleMouseEnter}
        disabled={!flatJsons}
      >
        <InlineIcon i={<HiChevronDoubleDown />} />
        <span>Unfold</span>
      </MenuButton>
    )}

  </div>;
}

const AppTitle = (props: {
  mode: HeaderMode;
}) => {
  return <h2
    className="px-2 whitespace-nowrap break-keep"
  >
    JSON Analyzer(alpha)
  </h2>
};

const MainLine = (props: {
  mode: HeaderMode;
}) => {
  const { mode } = props;

  return (<div
    className="shrink-0 grow-0 gap-2 flex flex-row items-center"
  >
    <AppTitle mode={mode} />
    <OpetationButtons mode={mode} />
    <ThemeSelector />
  </div>);
};

export const HeaderBar = (props: {
  itemViewRef: MutableRefObject<any>;
  mode?: HeaderMode;
}) => {
  const mode = props.mode || 'json-viewer';

  return (<>
    <MainLine mode={mode} />
    {mode === 'json-viewer' && <DiffLine />}
    {mode === 'json-viewer' && <NarrowingLine itemViewRef={props.itemViewRef} />}
  </>);
};