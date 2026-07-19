import { useState } from "react";
import { toast } from "react-toastify";
import {
  VscChevronDown,
  VscChevronRight,
  VscClose,
  VscGraph,
} from "react-icons/vsc";
import { FaRegCopy } from "react-icons/fa";
import { HiChevronDoubleDown, HiChevronDoubleUp } from "react-icons/hi";
import { InlineIcon } from "../lv1/InlineIcon";
import {
  JsonValueType,
  ProfileNode,
  UNIQUE_VALUE_CAP,
  keyOccurrenceRate,
  toJsonSchemaDocument,
  uniqueValueEntries,
} from "@/libs/profile";
import { useProfile, useProfilePreference } from "@/states/profile";
import { useDiffTarget } from "@/states/diff";
import { useManipulation } from "@/states/manipulation";
import { ClipboardAccess } from "@/libs/sideeffect";
import { composeFacetQuery } from "@/libs/facet";

/**
 * ツリーの初期展開深さ
 */
const DefaultOpenDepth = 2;

/**
 * ユニーク値分布の表示件数上限
 */
const ValueDistributionLimit = 20;

const TypeNameOrder: JsonValueType[] = [
  "map",
  "array",
  "string",
  "number",
  "boolean",
  "null",
];

const TypeDisplayNames: Record<JsonValueType, string> = {
  map: "object",
  array: "array",
  string: "string",
  number: "number",
  boolean: "boolean",
  null: "null",
};

const formatRate = (rate: number) => `${Math.round(rate * 1000) / 10}%`;

/**
 * ファセットの適用/解除 (プロファイル → 検索の結線)。
 * クリックで advanced モードに切り替えてクエリをセットし検索パネルを開く。
 * すでに同じクエリなら解除 (クエリを空にする)。
 */
const useFacetActions = () => {
  const { manipulation, setFilteringQuery, setFilteringMode, setFilteringBooleanPreference } = useManipulation();

  const applyFacet = (facetQuery: string, isActive: boolean) => {
    if (isActive) {
      setFilteringQuery("");
      return;
    }
    setFilteringMode("advanced");
    setFilteringQuery(facetQuery);
    setFilteringBooleanPreference("showPanel", true);
  };

  return { filteringQuery: manipulation.filteringQuery, applyFacet };
};

const TypeChips = (props: { node: ProfileNode }) => {
  const { typeCounts } = props.node;
  const types = TypeNameOrder.filter((t) => typeCounts[t]);
  const isMixed = types.length > 1;
  return (
    <>
      {types.map((t) => (
        <span key={t} className={`profile-type profile-type-${t} shrink-0`}>
          {TypeDisplayNames[t]}
          {isMixed ? `:${typeCounts[t]}` : ""}
        </span>
      ))}
    </>
  );
};

const NodeStats = (props: {
  node: ProfileNode;
  keypath: string;
  showValues: boolean;
  toggleShowValues: () => void;
}) => {
  const { node, keypath } = props;
  const { filteringQuery, applyFacet } = useFacetActions();
  const stats: JSX.Element[] = [];

  // true / false / null の統計チップをファセットとしてクリック可能にする
  const facetChip = (key: string, literal: string, label: string, enabled: boolean) => {
    const facetQuery = enabled ? composeFacetQuery(keypath, literal) : null;
    const isActive = facetQuery !== null && filteringQuery === facetQuery;
    return (
      <span
        key={key}
        className={`profile-stat shrink-0 ${facetQuery ? "profile-facet-stat" : ""} ${isActive ? "is-active" : ""}`}
        title={facetQuery ? `クリックで ${literal} に絞り込む (再クリックで解除)` : undefined}
        onClick={facetQuery ? () => applyFacet(facetQuery, isActive) : undefined}
      >
        {label}
      </span>
    );
  };

  if (node.numberStats) {
    const { min, max } = node.numberStats;
    stats.push(
      <span key="number" className="profile-stat shrink-0">
        {min === max ? `${min}` : `${min}–${max}`}
      </span>,
    );
  }

  if (node.booleanStats) {
    const { trueCount, falseCount } = node.booleanStats;
    stats.push(facetChip("true", "true", `true:${trueCount}`, trueCount > 0));
    stats.push(facetChip("false", "false", `false:${falseCount}`, falseCount > 0));
  }

  const nullCount = node.typeCounts.null ?? 0;
  if (nullCount > 0 && nullCount < node.total) {
    stats.push(facetChip("null", "null", `null ${formatRate(nullCount / node.total)}`, true));
  }

  if (node.uniqueValues) {
    const size = node.uniqueValues.counts.size;
    stats.push(
      <span
        key="unique"
        className={`profile-stat profile-unique shrink-0 cursor-pointer ${props.showValues ? "is-open" : ""}`}
        title="値の分布を表示する"
        onClick={props.toggleShowValues}
      >
        {size}
        {node.uniqueValues.capped ? "+" : ""}種
      </span>,
    );
  }

  return <>{stats}</>;
};

const ValueDistribution = (props: {
  node: ProfileNode;
  depth: number;
  /** このノードのキーパスパターン (ファセットクエリの合成に使う) */
  keypath: string;
}) => {
  const { node, depth, keypath } = props;
  const { filteringQuery, applyFacet } = useFacetActions();
  const entries = uniqueValueEntries(node);
  const top = entries.slice(0, ValueDistributionLimit);
  const rest = entries.length - top.length;
  // entries は降順なので先頭が最頻値 = バーのスケール基準
  const maxCount = top.length > 0 ? top[0][1] : 0;

  return (
    <div
      className="profile-values flex flex-col"
      style={{ paddingLeft: `${depth * 0.8 + 1.6}rem` }}
    >
      {top.map(([literal, count]) => {
        const facetQuery = composeFacetQuery(keypath, literal);
        const isActive = facetQuery !== null && filteringQuery === facetQuery;
        return (
          <div
            key={literal}
            className={`profile-value-row flex flex-row items-center gap-2 ${facetQuery ? "is-clickable" : ""} ${isActive ? "is-active" : ""}`}
            title={
              facetQuery
                ? `${literal}\nクリックでこの値に絞り込む (再クリックで解除)`
                : `${literal}\nクエリで表現できない値のため絞り込めません`
            }
            onClick={facetQuery ? () => applyFacet(facetQuery, isActive) : undefined}
          >
            <span className="profile-value-literal shrink overflow-hidden text-ellipsis whitespace-nowrap break-keep">
              {literal}
            </span>
            <span className="profile-stat shrink-0 ml-auto">×{count}</span>
            <span className="profile-value-bar-track w-20 shrink-0 flex flex-row items-center">
              <span
                className="profile-value-bar"
                style={{
                  width: `${maxCount > 0 ? (count / maxCount) * 100 : 0}%`,
                }}
              />
            </span>
          </div>
        );
      })}
      {rest > 0 && <div className="profile-stat">他 {rest} 種</div>}
      {node.uniqueValues?.capped && (
        <div className="profile-stat">
          (種類数が {UNIQUE_VALUE_CAP} を超えたため追跡を打ち切り)
        </div>
      )}
      {(node.skippedLongStrings ?? 0) > 0 && (
        <div className="profile-stat">
          (長い文字列 {node.skippedLongStrings} 件は集計外)
        </div>
      )}
    </div>
  );
};

const ProfileNodeRow = (props: {
  node: ProfileNode;
  depth: number;
  parent: ProfileNode | null;
  /**
   * このノードのキーパスパターン (例: items.*.status)。ルートは rootKey (全体なら "")
   */
  keypath: string;
  /**
   * この深さ未満のノードを初期展開する (Fold All = 0 / Unfold All = Infinity)
   */
  defaultOpenDepth: number;
}) => {
  const { node, depth, parent, keypath, defaultOpenDepth } = props;
  const [isOpen, setIsOpen] = useState(depth < defaultOpenDepth);
  const [showValues, setShowValues] = useState(false);
  const hasChildren = !!node.children && node.children.size > 0;

  const keyLabel = node.key === "" ? "(root)" : node.key;
  // map の子キーには出現率を出す (配列マージの "*" は対象外)
  const occurrence =
    parent && node.key !== "*" && (parent.typeCounts.map ?? 0) > 0
      ? keyOccurrenceRate(parent, node)
      : null;

  return (
    <div className="profile-node">
      <div
        className="profile-node-row flex flex-row items-center gap-2"
        style={{ paddingLeft: `${depth * 0.8}rem` }}
      >
        <span
          className={`profile-toggle w-4 shrink-0 ${hasChildren ? "cursor-pointer" : ""}`}
          onClick={() => hasChildren && setIsOpen((prev) => !prev)}
        >
          {hasChildren ? (
            isOpen ? (
              <VscChevronDown />
            ) : (
              <VscChevronRight />
            )
          ) : null}
        </span>
        <span
          className="profile-key shrink overflow-hidden text-ellipsis whitespace-nowrap break-keep"
          title={keyLabel}
        >
          {keyLabel}
        </span>
        <TypeChips node={node} />
        {occurrence !== null && (
          <span
            className={`shrink-0 ${occurrence < 1 ? "profile-occurrence-partial" : "profile-occurrence"}`}
            title="親オブジェクトにおけるこのキーの出現率"
          >
            {formatRate(occurrence)}
          </span>
        )}
        {node.total > 1 && (
          <span className="profile-stat shrink-0">×{node.total}</span>
        )}
        <NodeStats
          node={node}
          keypath={keypath}
          showValues={showValues}
          toggleShowValues={() => setShowValues((prev) => !prev)}
        />
      </div>

      {showValues && <ValueDistribution node={node} depth={depth} keypath={keypath} />}

      {isOpen &&
        hasChildren &&
        Array.from(node.children!.entries()).map(([key, child]) => (
          <ProfileNodeRow
            key={key}
            node={child}
            depth={depth + 1}
            parent={node}
            keypath={keypath ? `${keypath}.${key}` : key}
            defaultOpenDepth={defaultOpenDepth}
          />
        ))}
    </div>
  );
};

export const ProfileView = () => {
  const profile = useProfile();
  const { diffTarget } = useDiffTarget();
  const { setShowProfilePanel } = useProfilePreference();
  const [defaultOpenDepth, setDefaultOpenDepth] = useState(DefaultOpenDepth);
  // ツリーを key で再マウントし, 各行のローカル開閉 state を defaultOpenDepth で初期化し直す
  const [treeEpoch, setTreeEpoch] = useState(0);

  const resetTreeOpenState = (openDepth: number) => {
    setDefaultOpenDepth(openDepth);
    setTreeEpoch((prev) => prev + 1);
  };

  const copySchema = async () => {
    if (!profile) {
      return;
    }
    try {
      const schema = toJsonSchemaDocument(profile.profile);
      await ClipboardAccess.copyText(JSON.stringify(schema, null, 2));
      toast("JSON Schema をコピーしました");
    } catch (e) {
      console.error(e);
      toast.error("コピーに失敗しました");
    }
  };

  const content = (() => {
    if (diffTarget) {
      return <p className="px-2 text-sm">diff モードでは利用できません。</p>;
    }
    if (!profile) {
      return (
        <p className="px-2 text-sm">
          プロファイルを表示できるデータがありません。
        </p>
      );
    }
    return (
      <>
        <div className="px-2 shrink-0 grow-0 flex flex-row justify-between items-center gap-2">
          <p
            className="shrink text-sm overflow-hidden text-ellipsis whitespace-nowrap break-keep"
            title={profile.rootKey || "ドキュメント全体"}
          >
            対象: {profile.rootKey ? profile.rootKey : "ドキュメント全体"}
          </p>
          <div className="shrink-0 flex flex-row items-center">
            <button
              className="flippable shrink-0 px-1 py-1 text-sm flex flex-row items-center"
              title="すべて折りたたむ"
              onClick={() => resetTreeOpenState(0)}
            >
              <InlineIcon i={<HiChevronDoubleUp />} />
            </button>
            <button
              className="flippable shrink-0 px-1 py-1 text-sm flex flex-row items-center"
              title="すべて展開する"
              onClick={() => resetTreeOpenState(Infinity)}
            >
              <InlineIcon i={<HiChevronDoubleDown />} />
            </button>
            <button
              className="flippable shrink-0 px-1 py-1 text-sm flex flex-row items-center"
              title="推定した JSON Schema (draft-07) をクリップボードにコピーする"
              onClick={copySchema}
            >
              <InlineIcon i={<FaRegCopy />} />
              <span>Schema</span>
            </button>
          </div>
        </div>

        {/* ツリーが内在高さを持つと祖先flexが伸びてスクロールが死ぬため, absoluteで切り離す */}
        <div className="shrink grow relative">
          <div className="absolute inset-0 px-2 overflow-y-auto overflow-x-hidden font-monospacy text-sm">
            <ProfileNodeRow
              key={treeEpoch}
              node={profile.profile}
              depth={0}
              parent={null}
              keypath={profile.rootKey}
              defaultOpenDepth={defaultOpenDepth}
            />
          </div>
        </div>
      </>
    );
  })();

  return (
    <div className="profile-view h-full shrink grow flex flex-col gap-2 overflow-hidden">
      <h2 className="color-inverted px-2 py-1 flex flex-row gap-1 items-center font-bold">
        <InlineIcon i={<VscGraph />} />
        <p>プロファイル</p>
        <button
          className="profile-close-button ml-auto shrink-0 px-1 flex flex-row items-center"
          title="パネルを閉じる"
          onClick={() => setShowProfilePanel(false)}
        >
          <InlineIcon i={<VscClose />} />
        </button>
      </h2>
      {content}
    </div>
  );
};
