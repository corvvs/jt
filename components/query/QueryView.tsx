import _ from "lodash";
import { MultipleButtons } from "../lv1/MultipleButtons";
import { useManipulation } from "@/states/manipulation";
import { PreferencePanel } from "../lv2/FilterPreferencePanel";
import { SimpleFilterCard } from "./SimpleFilterCard";
import { AdvancedFilterCard } from "./AdvancedFilterCard";
import { InlineIcon } from "../lv1/InlineIcon";
import { FaSearch } from "react-icons/fa";
import { useCallback, useEffect, useRef } from "react";
import { useAdvancedQuery } from "@/libs/advanced_query";

const ModePanel = () => {
  const { filteringPreference, setFilteringMode } = useManipulation();

  return <MultipleButtons
    currentKey={filteringPreference.mode}
    items={[
      {
        key: "simple",
        title: "Simple",
        hint: "キー・値に対する部分一致検索",
      },
      {
        key: "advanced",
        title: "Advanced",
        hint: "JSONの構造自体に対する検索",
      },
    ]}
    onClick={(item) => setFilteringMode(item.key)}
  />
};

const QueryInputField = () => {
  const {
    manipulation,
    filteringPreference,
    setFilteringQuery,
  } = useManipulation();

  const inputRef = useRef<any>();
  const reflectQuery = useCallback(
    _.debounce((value: string) => {
      setFilteringQuery(prev => {
        return value === prev ? prev : value;
      });
    }, 99), [setFilteringQuery]
  );

  useEffect(() => {
    inputRef.current.value = manipulation.filteringQuery;
  }, []);

  const placeholder = filteringPreference.mode === "simple"
    ? "キーまたは値に部分一致"
    : "検索クエリを入力...";

  return <div>
    <input
      type="text"
      ref={inputRef}
      className="p-1 bg-transparent	border-[1px] outline-0 w-full"
      placeholder={placeholder}
        onChange={(e) => {
        reflectQuery(e.currentTarget.value);
      }}
    />
  </div>
};

export const QueryView = () => {
  const { filteringPreference } = useManipulation();
  const { parsedQuery } = useAdvancedQuery();

  const syntaxErrorContent = (() => {
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
    ? SimpleFilterCard
    : AdvancedFilterCard;

  return <div
    className="query-view shrink grow flex flex-col gap-2 overflow-hidden"
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
        <h3>
          検索モード
        </h3>
        <div>
          <ModePanel />
        </div>
      </div>
    </div>

    <div
      className="px-2"
    >
      <div
        className="flex flex-col items-stretch"
      >
        <h3>
          結果の表示方法
        </h3>
        <div className="flex flex-row justify-end">
          <PreferencePanel />
        </div>
      </div>
    </div>

    <div
      className="px-2 shrink grow"
    >
      <FilterCard />
    </div>

  </div>;
};

