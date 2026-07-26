import { useState } from "react";
import { useAtomValue, useStore } from "jotai";
import _ from "lodash";
import { FaHighlighter, FaSearch } from "react-icons/fa";
import { VscChevronDown, VscChevronUp, VscClose, VscEye, VscEyeClosed, VscTrash } from "react-icons/vsc";
import { InlineIcon } from "../lv1/InlineIcon";
import { MultipleButtons } from "../lv1/MultipleButtons";
import { HIGHLIGHT_PALETTE_SIZE, HighlightRule } from "@/libs/highlight";
import { parseQuery } from "@/libs/advanced_query/parseQuery";
import {
  applyRuleToSearch,
  highlightMapsAtom,
  useHighlightPreference,
  useHighlightRules,
} from "@/states/highlight";
import { ModeDescription, QueryMode, useQuery } from "@/states/manipulation/query";
import { useManipulation } from "@/states/manipulation";
import { useDiffTarget } from "@/states/diff";

/**
 * ハイライトルールの管理パネル.
 *
 * ルールは検索とは独立した注釈レイヤーなので, 検索パネルではなく右側の
 * 独立パネル (Profile / Pins と排他) に置く。検索との行き来は
 * 「検索から取込」(検索 → ルール) と行の検索ボタン (ルール → 検索) の
 * 明示的な導線だけにする。
 */

/** 既存ルールが使っていない最初の色. 全色使用済みならルール数で巡回 */
const nextFreeColor = (rules: HighlightRule[]): number => {
  const used = new Set(rules.map((r) => r.color));
  for (let k = 0; k < HIGHLIGHT_PALETTE_SIZE; k++) {
    if (!used.has(k)) { return k; }
  }
  return rules.length % HIGHLIGHT_PALETTE_SIZE;
};

/** クエリの入力内容に対する問題の説明. 空入力はエラー扱いにしない (未入力なだけ) */
const queryProblem = (mode: QueryMode, query: string): string | null => {
  const trimmed = query.trim();
  if (!trimmed) { return null; }
  if (mode === "simple") {
    return trimmed.length < 2 ? "2文字以上で入力してください" : null;
  }
  const syntaxError = parseQuery(trimmed).syntaxError;
  return syntaxError ? `${syntaxError.subname}: ${syntaxError.message}` : null;
};

const queryPlaceholder = (mode: QueryMode) => mode === "simple"
  ? "キーまたは値に部分一致"
  : 'items.*[status:"error"] のように入力...';

const ModeButtons = (props: {
  mode: QueryMode;
  onChange: (mode: QueryMode) => void;
}) => (
  <MultipleButtons
    currentKey={props.mode}
    items={[
      { key: "simple", title: "Simple", hint: ModeDescription["simple"] },
      { key: "advanced", title: "Advanced", hint: ModeDescription["advanced"] },
    ]}
    onClick={(item) => props.onChange(item.key)}
  />
);

const ColorPicker = (props: {
  value: number;
  onChange: (color: number) => void;
}) => (
  <div className="flex flex-row items-center gap-1">
    {_.range(HIGHLIGHT_PALETTE_SIZE).map((k) => (
      <button
        key={k}
        type="button"
        className={`hl-swatch hl-swatch-${k} ${k === props.value ? "hl-swatch-selected" : ""}`}
        title={`色 ${k + 1}`}
        onClick={() => props.onChange(k)}
      />
    ))}
  </div>
);

const AddRuleSection = (props: {
  onInputFocus: (focused: boolean) => void;
}) => {
  const { highlightRules, addRule } = useHighlightRules();
  const { manipulation, filteringPreference } = useManipulation();
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<QueryMode>("advanced");
  // null = 自動 (未使用の色)。追加後に自動へ戻すことで, 連続追加で色が自然に散らばる
  const [color, setColor] = useState<number | null>(null);
  const effectiveColor = color ?? nextFreeColor(highlightRules);

  const problem = queryProblem(mode, query);
  const canAdd = !!query.trim() && !problem;
  const currentSearchQuery = manipulation.filteringQuery.trim();

  const submit = () => {
    if (!canAdd) { return; }
    addRule({ name: "", query: query.trim(), mode, color: effectiveColor });
    setQuery("");
    setColor(null);
  };

  return (
    <div className="px-2 flex flex-col gap-1">
      <div className="flex flex-row items-center gap-1">
        <h3 className="font-bold text-sm">新しいルール</h3>
        <button
          className="hl-rule-action flippable ml-auto shrink-0 flex flex-row items-center px-1 text-sm"
          disabled={!currentSearchQuery}
          title="検索ボックスの現在のクエリをフォームに取り込む"
          onClick={() => {
            if (!currentSearchQuery) { return; }
            setQuery(manipulation.filteringQuery);
            setMode(filteringPreference.mode);
          }}
        >
          <InlineIcon i={<FaSearch />} />
          <span>検索から取込</span>
        </button>
      </div>
      <input
        type="text"
        className="hl-rule-input font-monospacy text-sm px-1 w-full"
        placeholder={queryPlaceholder(mode)}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        onFocus={() => props.onInputFocus(true)}
        onBlur={() => props.onInputFocus(false)}
        // グローバルショートカット (Cmd+A 等) に入力中のキーを奪われないようにする
        onKeyDown={(e) => {
          e.stopPropagation();
          if (e.key === "Enter") { submit(); }
        }}
      />
      {problem && <p className="hl-rule-invalid">{problem}</p>}
      <div className="flex flex-row items-center justify-between gap-1">
        <ModeButtons mode={mode} onChange={setMode} />
        <ColorPicker value={effectiveColor} onChange={setColor} />
      </div>
      <button
        className="hl-rule-action flippable self-end border-[1px] px-2 text-sm"
        disabled={!canAdd}
        onClick={submit}
      >
        追加
      </button>
    </div>
  );
};

type RulePatch = Partial<Pick<HighlightRule, "name" | "query" | "mode" | "color">>;

const EditRuleForm = (props: {
  rule: HighlightRule;
  onCommit: (patch: RulePatch) => void;
  onCancel: () => void;
  onInputFocus: (focused: boolean) => void;
}) => {
  const { rule } = props;
  const [name, setName] = useState(rule.name);
  const [query, setQuery] = useState(rule.query);
  const [mode, setMode] = useState<QueryMode>(rule.mode);
  const [color, setColor] = useState(rule.color);

  const problem = queryProblem(mode, query);
  const canSave = !!query.trim() && !problem;
  const commit = () => {
    if (!canSave) { return; }
    props.onCommit({ name: name.trim(), query: query.trim(), mode, color });
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation();
    if (e.key === "Enter") { commit(); }
    if (e.key === "Escape") { props.onCancel(); }
  };
  const focusProps = {
    onFocus: () => props.onInputFocus(true),
    onBlur: () => props.onInputFocus(false),
  };

  return (
    <div className="hl-rule-row px-1 py-1 flex flex-col gap-1">
      <input
        type="text"
        className="hl-rule-input text-sm px-1 w-full"
        placeholder="名前 (省略可)"
        autoFocus
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        {...focusProps}
      />
      <input
        type="text"
        className="hl-rule-input font-monospacy text-sm px-1 w-full"
        placeholder={queryPlaceholder(mode)}
        value={query}
        onChange={(e) => setQuery(e.currentTarget.value)}
        onKeyDown={handleKeyDown}
        {...focusProps}
      />
      {problem && <p className="hl-rule-invalid">{problem}</p>}
      <div className="flex flex-row items-center justify-between gap-1">
        <ModeButtons mode={mode} onChange={setMode} />
        <ColorPicker value={color} onChange={setColor} />
      </div>
      <div className="flex flex-row justify-end gap-2">
        <button className="hl-rule-action flippable border-[1px] px-2 text-sm" onClick={props.onCancel}>
          キャンセル
        </button>
        <button className="hl-rule-action flippable border-[1px] px-2 text-sm" disabled={!canSave} onClick={commit}>
          保存
        </button>
      </div>
    </div>
  );
};

const RuleRow = (props: {
  rule: HighlightRule;
  count: number | undefined;
  /** highlightMapsAtom が生きているか (diff 中・全ルール無効時は counts 自体が無い) */
  mapsActive: boolean;
  isFirst: boolean;
  isLast: boolean;
  onStartEdit: () => void;
  onToggle: () => void;
  onCycleColor: () => void;
  onSend: () => void;
  onRemove: () => void;
  onMove: (direction: -1 | 1) => void;
}) => {
  const { rule } = props;
  const displayName = rule.name || rule.query;

  return (
    <div className={`hl-rule-row px-1 py-0.5 flex flex-row items-center gap-1 ${rule.enabled ? "" : "hl-rule-off"}`}>
      <button
        type="button"
        className={`hl-swatch hl-swatch-${rule.color}`}
        title="色を切り替える"
        onClick={props.onCycleColor}
      />
      <button
        className={`shrink grow min-w-0 truncate text-left text-sm ${rule.name ? "" : "font-monospacy"}`}
        title={`編集: ${rule.query}`}
        onClick={props.onStartEdit}
      >
        {displayName}
      </button>
      {rule.enabled && props.mapsActive && (
        props.count !== undefined
          ? <span className="hl-rule-count shrink-0">{props.count}件</span>
          : <span className="hl-rule-invalid shrink-0" title="クエリが不正か短すぎるため評価されていません">無効</span>
      )}
      <button
        className="hl-rule-action shrink-0"
        title={rule.enabled ? "このルールを無効にする" : "このルールを有効にする"}
        onClick={props.onToggle}
      >
        <InlineIcon i={rule.enabled ? <VscEye /> : <VscEyeClosed />} />
      </button>
      <button className="hl-rule-action shrink-0" title="このクエリで検索する" onClick={props.onSend}>
        <InlineIcon i={<FaSearch />} />
      </button>
      <button className="hl-rule-action shrink-0" title="削除" onClick={props.onRemove}>
        <InlineIcon i={<VscTrash />} />
      </button>
      <button
        className="hl-rule-action shrink-0"
        title="優先度を上げる (上へ)"
        disabled={props.isFirst}
        onClick={() => props.onMove(-1)}
      >
        <InlineIcon i={<VscChevronUp />} />
      </button>
      <button
        className="hl-rule-action shrink-0"
        title="優先度を下げる (下へ)"
        disabled={props.isLast}
        onClick={() => props.onMove(1)}
      >
        <InlineIcon i={<VscChevronDown />} />
      </button>
    </div>
  );
};

export const HighlightRulesView = () => {
  const { diffTarget } = useDiffTarget();
  const { highlightRules, removeRule, updateRule, toggleRule, moveRule } = useHighlightRules();
  const { setShowHighlightPanel } = useHighlightPreference();
  const { setFilterInputFocused } = useQuery();
  const highlightMaps = useAtomValue(highlightMapsAtom);
  const store = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);

  const content = (() => {
    if (diffTarget) {
      return <p className="px-2 text-sm">diff モードでは利用できません。</p>;
    }
    return (
      <>
        <AddRuleSection onInputFocus={setFilterInputFocused} />
        {highlightRules.length === 0 ? (
          <p className="px-2 text-sm">
            ルールはまだありません。クエリと色を指定して追加すると、マッチした行に色が付きます。
          </p>
        ) : (
          <>
            <div className="px-2 flex flex-row items-center">
              <h3 className="font-bold text-sm">ルール</h3>
              <span className="hl-rule-count ml-auto">上にあるルールほど優先</span>
            </div>
            <div className="shrink grow relative">
              <div className="absolute inset-0 overflow-y-auto overflow-x-hidden flex flex-col">
                {highlightRules.map((rule, i) => (
                  editingId === rule.id ? (
                    <EditRuleForm
                      key={rule.id}
                      rule={rule}
                      onCommit={(patch) => { updateRule(rule.id, patch); setEditingId(null); }}
                      onCancel={() => setEditingId(null)}
                      onInputFocus={setFilterInputFocused}
                    />
                  ) : (
                    <RuleRow
                      key={rule.id}
                      rule={rule}
                      count={highlightMaps?.counts[rule.id]}
                      mapsActive={!!highlightMaps}
                      isFirst={i === 0}
                      isLast={i === highlightRules.length - 1}
                      onStartEdit={() => setEditingId(rule.id)}
                      onToggle={() => toggleRule(rule.id)}
                      onCycleColor={() => updateRule(rule.id, { color: (rule.color + 1) % HIGHLIGHT_PALETTE_SIZE })}
                      onSend={() => applyRuleToSearch(store, rule)}
                      onRemove={() => removeRule(rule.id)}
                      onMove={(direction) => moveRule(rule.id, direction)}
                    />
                  )
                ))}
              </div>
            </div>
          </>
        )}
      </>
    );
  })();

  return (
    <div className="highlight-view h-full shrink grow flex flex-col gap-2 overflow-hidden">
      <h2 className="color-inverted px-2 py-1 flex flex-row gap-1 items-center font-bold">
        <InlineIcon i={<FaHighlighter />} />
        <p>ハイライトルール</p>
        {highlightRules.length > 0 && <p className="text-sm">({highlightRules.length})</p>}
        <button
          className="profile-close-button ml-auto shrink-0 px-1 flex flex-row items-center"
          title="パネルを閉じる"
          onClick={() => setShowHighlightPanel(false)}
        >
          <InlineIcon i={<VscClose />} />
        </button>
      </h2>
      {content}
    </div>
  );
};
