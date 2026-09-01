import _ from "lodash";
import { MultipleButtons } from "../lv1/MultipleButtons";
import { useManipulation } from "@/states/manipulation";
import { FilteringResultAppearancePanel } from "../lv2/FilterPreferencePanel";
import { AdvancedFilterCard } from "./AdvancedFilterCard";
import { InlineIcon } from "../lv1/InlineIcon";
import { FaSearch } from "react-icons/fa";
import { ReactNode, useCallback, useEffect, useRef } from "react";
import { useAdvancedQuery } from "@/libs/advanced_query";
import { ModeDescription, useQuery } from "@/states/manipulation/query";
import { HitCard } from "./HitCard";
import { SavedQueriesSection } from "./SavedQueriesSection";
import { FootHinted } from "./FootHinted";

interface QueryViewProps {
  matchNavigation?: {
    goToNextMatch: () => void;
    goToPreviousMatch: () => void;
    goToFirstMatch: () => void;
    matchedCount: number;
    currentMatchIndex: number;
  };
}

const ModePanel = () => {
  const { filteringPreference, setFilteringMode } = useManipulation();

  return <MultipleButtons
    currentKey={filteringPreference.mode}
    items={[
      {
        key: "simple",
        title: "Simple",
        hint: ModeDescription["simple"],
      },
      {
        key: "advanced",
        title: "Advanced",
        hint: ModeDescription["advanced"],
      },
    ]}
    onClick={(item) => setFilteringMode(item.key)}
  />
};

// 入力欄の高さの下限・上限 (行数)
const QueryInputMinRows = 1;
const QueryInputMaxRows = 5;

/**
 * 入力内容の行数に合わせて textarea の高さを調節する.
 * 上限行数を超えたときだけ縦スクロールさせ, それ以外ではスクロールバーを隠す.
 */
const fitHeightToContent = (el: HTMLTextAreaElement | null) => {
  if (!el) { return; }
  const style = window.getComputedStyle(el);
  const lineHeight = parseFloat(style.lineHeight);
  const verticalPadding = parseFloat(style.paddingTop) + parseFloat(style.paddingBottom);
  const verticalBorder = parseFloat(style.borderTopWidth) + parseFloat(style.borderBottomWidth);
  if (!_.isFinite(lineHeight) || !_.isFinite(verticalPadding) || !_.isFinite(verticalBorder)) { return; }
  const minHeight = lineHeight * QueryInputMinRows + verticalPadding + verticalBorder;
  const maxHeight = lineHeight * QueryInputMaxRows + verticalPadding + verticalBorder;
  // 一度高さを捨ててから scrollHeight を測らないと, 行が減った場合に縮められない.
  el.style.height = "auto";
  // box-sizing: border-box なので, scrollHeight (内容+padding) に border 分を足して揃える.
  const contentHeight = el.scrollHeight + verticalBorder;
  el.style.height = `${_.clamp(contentHeight, minHeight, maxHeight)}px`;
  el.style.overflowY = contentHeight > maxHeight ? "auto" : "hidden";
};

const QueryInputField = () => {
  const {
    filteringPreference,
    filteringQuery,
    setFilteringQuery,
    setFilterInputFocused,
  } = useQuery();
  const { filteringPreference: manipulationPreference } = useManipulation();

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const reflectQuery = useCallback(
    _.debounce((value: string) => {
      setFilteringQuery(prev => {
        return value === prev ? prev : value;
      });
    }, 300), [setFilteringQuery]
  );

  useEffect(() => {
    const el = inputRef.current;
    if (!el) { return; }
    el.value = filteringQuery;
    el.focus();
    fitHeightToContent(el);
  }, [filteringQuery]);

  // 表示時にフォーカスを当てるための処理
  useEffect(() => {
    if (manipulationPreference.showPanel) {
      inputRef.current?.focus();
      fitHeightToContent(inputRef.current);
    }
  }, [manipulationPreference.showPanel]);

  const placeholder = filteringPreference.mode === "simple"
    ? "キーまたは値に部分一致"
    : 'items.*[status:"error"] のように入力...';

  return <div>
    <textarea
      ref={inputRef}
      rows={QueryInputMinRows}
      className="block p-1 bg-transparent border-[1px] outline-0 w-full font-monospacy leading-normal resize-none overflow-y-hidden"
      placeholder={placeholder}
      onChange={(e) => {
        fitHeightToContent(e.currentTarget);
        reflectQuery(e.currentTarget.value);
      }}
      onFocus={() => {
        setFilterInputFocused(true);
      }}
      onBlur={() => {
        setFilterInputFocused(false);
      }}
    />
  </div>
};

export const QueryView = ({ matchNavigation }: QueryViewProps = {}) => {
  const {
    filteringPreference,
    queryModeDescription,
    appearanceDescription,
  } = useManipulation();
  const { parsedQuery } = useAdvancedQuery();

  const syntaxErrorContent = (() => {
    if (!parsedQuery) { return null; }
    if (!parsedQuery.syntaxError) { return null; }
    return <>
      <p
        className="shrink-0 grow-0 font-bold"
      >{parsedQuery.syntaxError.subname}</p>
      <p
        className="shrink grow text-ellipsis whitespace-nowrap break-keep overflow-hidden"
      >{parsedQuery.syntaxError.message}</p>
    </>
  })();

  const FilterCard = filteringPreference.mode === "simple"
    ? null
    : <AdvancedFilterCard />;

  return <div
    className="query-view h-full shrink grow flex flex-col gap-2 overflow-hidden"
  >

    <h2
      className="color-inverted px-2 py-1 flex flex-row gap-1 items-center font-bold"
    >
      <InlineIcon i={<FaSearch />} />
      <p>検索</p>
    </h2>

    <div
      className="px-2 shrink-0 grow-0 flex flex-col gap-1"
    >
      <QueryInputField />

      <div
        className="h-[1.5em] flex flex-row items-center text-red-400 gap-2"
      >
        {syntaxErrorContent}
      </div>
    </div>

    <div
      className="px-2"
    >

      <div
        className="flex flex-row justify-between items-center"
      >
        <div
          className="flex flex-col"
        >

          <h3
            className="font-bold text-sm"
          >
            検索モード
          </h3>

          <div
            className="hint-footer hint-footer-blank"
          ></div>

        </div>

        <FootHinted hint={queryModeDescription}><ModePanel /></FootHinted>

      </div>
    </div>

    <div
      className="px-2"
    >
      <div
        className="flex flex-col items-stretch"
      >
        <h3
          className="font-bold text-sm"
        >
          結果の表示方法
        </h3>
        <FootHinted hint={appearanceDescription}><FilteringResultAppearancePanel /></FootHinted>
      </div>
    </div>

    <div
      className="px-2 shrink-0 grow-0"
    >
      <HitCard matchNavigation={matchNavigation} />
    </div>

    <div
      className="px-2 shrink grow overflow-hidden"
    >
      <SavedQueriesSection />
    </div>

    <div
      className="px-2 shrink-0 grow-0"
    >
      {FilterCard}
    </div>

  </div>;
};

