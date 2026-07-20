import { useRef, useState } from "react";
import { useStore } from "jotai";
import { FaRegBookmark } from "react-icons/fa";
import { VscEdit, VscTrash } from "react-icons/vsc";
import { useManipulation } from "@/states/manipulation";
import { useQuery } from "@/states/manipulation/query";
import { useSavedQueries, applySavedQuery, SavedQuery } from "@/states/saved_queries";
import { InlineIcon } from "../lv1/InlineIcon";

const SavedQueryRow = (props: {
  saved: SavedQuery;
  editing: boolean;
  editingName: string;
  onEditingNameChange: (v: string) => void;
  onStartEdit: () => void;
  onCommitEdit: () => void;
  onCancelEdit: () => void;
  onApply: () => void;
  onRemove: () => void;
  onInputFocus: (focused: boolean) => void;
}) => {
  const { saved, editing } = props;
  const displayName = saved.name || saved.query;
  // Escape 経由の blur では名前を確定させないためのフラグ
  const cancelledRef = useRef(false);

  return (
    <div className="saved-query-row flex flex-row items-center gap-1 px-1">
      {editing ? (
        <input
          className="saved-query-name-input shrink grow min-w-0 font-monospacy"
          value={props.editingName}
          autoFocus
          placeholder={saved.query}
          onChange={(e) => props.onEditingNameChange(e.currentTarget.value)}
          // 検索入力欄と同様, フォーカス中は filterInputFocused を立てて Jet 本体の
          // ショートカット (Cmd+A 等) を無効化し, 入力欄の編集ショートカットを使えるようにする
          onFocus={() => props.onInputFocus(true)}
          onKeyDown={(e) => {
            if (e.key === "Enter") { e.currentTarget.blur(); }
            else if (e.key === "Escape") { cancelledRef.current = true; e.currentTarget.blur(); }
          }}
          onBlur={() => {
            props.onInputFocus(false);
            if (cancelledRef.current) { cancelledRef.current = false; props.onCancelEdit(); }
            else { props.onCommitEdit(); }
          }}
        />
      ) : (
        <button
          className={`saved-query-apply shrink grow min-w-0 truncate text-left ${saved.name ? "" : "font-monospacy"}`}
          onClick={props.onApply}
          title={`適用: ${saved.query}`}
        >
          {displayName}
        </button>
      )}

      <span className="saved-query-mode shrink-0" title={saved.mode === "advanced" ? "Advanced" : "Simple"}>
        {saved.mode === "advanced" ? "Adv" : "Smp"}
      </span>

      {!editing && (
        <>
          <button className="saved-query-action shrink-0" onClick={props.onStartEdit} title="名前を変更">
            <InlineIcon i={<VscEdit />} />
          </button>
          <button className="saved-query-action shrink-0" onClick={props.onRemove} title="削除">
            <InlineIcon i={<VscTrash />} />
          </button>
        </>
      )}
    </div>
  );
};

export const SavedQueriesSection = () => {
  const { filteringPreference, manipulation } = useManipulation();
  const { savedQueries, addQuery, removeQuery, renameQuery } = useSavedQueries();
  const { setFilterInputFocused } = useQuery();
  const store = useStore();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const currentQuery = manipulation.filteringQuery.trim();

  const handleSave = () => {
    if (!currentQuery) { return; }
    const item = addQuery({
      name: "",
      query: manipulation.filteringQuery,
      mode: filteringPreference.mode,
      resultAppearance: filteringPreference.resultAppearance,
    });
    // 保存直後はその場で名前を付けられるよう編集状態にする
    setEditingId(item.id);
    setEditingName("");
  };

  const startEdit = (saved: SavedQuery) => {
    setEditingId(saved.id);
    setEditingName(saved.name);
  };

  const commitEdit = (id: string) => {
    renameQuery(id, editingName.trim());
    setEditingId(null);
  };

  return (
    <div className="saved-queries-section h-full flex flex-col gap-1 overflow-hidden">
      <div className="flex flex-row items-center gap-1">
        <h3 className="font-bold text-sm">保存済みクエリ</h3>
        <button
          className="saved-query-save flippable ml-auto shrink-0 flex flex-row items-center px-1"
          disabled={!currentQuery}
          onClick={handleSave}
          title="現在のクエリを保存する"
        >
          <InlineIcon i={<FaRegBookmark />} />
          <span>保存</span>
        </button>
      </div>

      {savedQueries.length === 0 ? (
        <p className="text-sm secondary-foreground">
          保存済みクエリはまだありません。クエリを入力して「保存」で追加できます。
        </p>
      ) : (
        <div className="shrink grow relative">
          <div className="absolute inset-0 overflow-y-auto overflow-x-hidden flex flex-col">
            {savedQueries.map((saved) => (
              <SavedQueryRow
                key={saved.id}
                saved={saved}
                editing={editingId === saved.id}
                editingName={editingName}
                onEditingNameChange={setEditingName}
                onStartEdit={() => startEdit(saved)}
                onCommitEdit={() => commitEdit(saved.id)}
                onCancelEdit={() => setEditingId(null)}
                onApply={() => applySavedQuery(store, saved)}
                onRemove={() => removeQuery(saved.id)}
                onInputFocus={setFilterInputFocused}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
