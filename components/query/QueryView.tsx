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

const QueryInputField = () => {
  const {
    filteringPreference,
    filteringQuery,
    setFilteringQuery,
    setFilterInputFocused,
  } = useQuery();
  const { filteringPreference: manipulationPreference } = useManipulation();

  const inputRef = useRef<any>();
  const reflectQuery = useCallback(
    _.debounce((value: string) => {
      setFilteringQuery(prev => {
        return value === prev ? prev : value;
      });
    }, 300), [setFilteringQuery]
  );

  useEffect(() => {
    inputRef.current.value = filteringQuery;
    inputRef.current.focus();
  }, [filteringQuery]);

  // 表示時にフォーカスを当てるための処理
  useEffect(() => {
    if (manipulationPreference.showPanel) {
      inputRef.current?.focus();
    }
  }, [manipulationPreference.showPanel]);

  const placeholder = filteringPreference.mode === "simple"
    ? "キーまたは値に部分一致"
    : "検索クエリを入力...";

  return <div>
    <input
      type="text"
      ref={inputRef}
      className="p-1 bg-transparent	border-[1px] outline-0 w-full font-monospacy"
      placeholder={placeholder}
      onChange={(e) => {
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
      <p>フィルタリング</p>
      <InlineIcon i={<FaSearch />} />
    </h2>

    <div
      className="px-2 flex flex-col gap-1"
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
      className="px-2 shrink grow"
    >
      {FilterCard}
    </div>

  </div>;
};

