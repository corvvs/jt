import { useEffect, useState } from "react";
import { VscClose, VscEdit, VscPinned, VscTrash } from "react-icons/vsc";
import { InlineIcon } from "../lv1/InlineIcon";
import { usePins, usePinsPreference, ResolvedPin } from "@/states/pins";
import { useDiffTarget } from "@/states/diff";
import { PinNavigation } from "@/hooks/usePinNavigation";

/**
 * メモの表示・編集領域。編集への入口 (鉛筆アイコン) は PinRow のアクション列にあり,
 * ここではメモ本文を全幅で出す (ピンエリアではキーパスよりメモの方が価値がある)。
 */
const PinMemo = (props: {
  memo: string;
  editing: boolean;
  onStartEditing: () => void;
  onStopEditing: () => void;
  onChange: (memo: string) => void;
}) => {
  const [draft, setDraft] = useState(props.memo);

  // 編集に入るたびに下書きを現在のメモで初期化する
  useEffect(() => {
    if (props.editing) { setDraft(props.memo); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.editing]);

  if (!props.editing) {
    // メモ本文は選択・コピーできるプレーンテキスト (クリックしても編集にならない)
    if (!props.memo) {
      return (
        <button
          className="pin-memo-placeholder text-left text-xs"
          title="メモを追加する"
          onClick={props.onStartEditing}
        >
          メモを追加…
        </button>
      );
    }
    return <p className="pin-memo text-xs break-words">{props.memo}</p>;
  }

  const commit = () => {
    props.onStopEditing();
    if (draft !== props.memo) { props.onChange(draft); }
  };

  return (
    <input
      className="pin-memo-input text-xs px-1"
      autoFocus
      value={draft}
      placeholder="メモ"
      onChange={(e) => setDraft(e.target.value)}
      onBlur={commit}
      // グローバルショートカット (Cmd+A 等) に入力中のキーを奪われないようにする
      onKeyDown={(e) => {
        e.stopPropagation();
        if (e.key === "Enter") { commit(); }
        if (e.key === "Escape") { props.onStopEditing(); }
      }}
    />
  );
};

const PinRow = (props: {
  resolved: ResolvedPin;
  onJump: () => void;
  onRemove: () => void;
  onUpdateMemo: (memo: string) => void;
}) => {
  const { pin, item } = props.resolved;
  const [editingMemo, setEditingMemo] = useState(false);
  const keypathLabel = pin.keypath || "(ルート)";

  return (
    <div className="pin-row px-2 py-1 flex flex-col">
      <div className="flex flex-row items-center gap-1">
        <button
          className="flippable shrink grow min-w-0 text-left"
          disabled={!item}
          title={item ? `${keypathLabel} へジャンプする` : "現在のドキュメントにこのキーパスが見つかりません"}
          onClick={props.onJump}
        >
          <span className="pin-keypath font-monospacy text-sm block overflow-hidden text-ellipsis whitespace-nowrap break-keep">
            {keypathLabel}
          </span>
        </button>
        <button
          className="flippable shrink-0 px-1 flex flex-row items-center"
          title="メモを編集する"
          onClick={() => setEditingMemo(true)}
        >
          <InlineIcon i={<VscEdit />} />
        </button>
        <button
          className="flippable shrink-0 px-1 flex flex-row items-center"
          title="ピンを外す"
          onClick={props.onRemove}
        >
          <InlineIcon i={<VscTrash />} />
        </button>
      </div>
      <p className="pin-value secondary-foreground font-monospacy text-xs overflow-hidden text-ellipsis whitespace-nowrap break-keep">
        {item ? pin.valuePreview : "キーパスが見つかりません (ドキュメントが編集された可能性)"}
      </p>
      <PinMemo
        memo={pin.memo}
        editing={editingMemo}
        onStartEditing={() => setEditingMemo(true)}
        onStopEditing={() => setEditingMemo(false)}
        onChange={props.onUpdateMemo}
      />
    </div>
  );
};

export const PinsView = (props: {
  pinNavigation: PinNavigation;
}) => {
  const { diffTarget } = useDiffTarget();
  const { removePin, updatePinMemo } = usePins();
  const { setShowPinsPanel } = usePinsPreference();
  const { resolvedPins, jumpToPin } = props.pinNavigation;

  const content = (() => {
    if (diffTarget) {
      return <p className="px-2 text-sm">diff モードでは利用できません。</p>;
    }
    if (resolvedPins.length === 0) {
      return (
        <p className="px-2 text-sm">
          ピンはまだありません。行にマウスを乗せると出るメニューからピンを打てます。
        </p>
      );
    }
    return (
      <div className="shrink grow relative">
        <div className="absolute inset-0 overflow-y-auto overflow-x-hidden">
          {resolvedPins.map((resolved) => (
            <PinRow
              key={resolved.pin.keypath}
              resolved={resolved}
              onJump={() => jumpToPin(resolved)}
              onRemove={() => removePin(resolved.pin.keypath)}
              onUpdateMemo={(memo) => updatePinMemo(resolved.pin.keypath, memo)}
            />
          ))}
        </div>
      </div>
    );
  })();

  return (
    <div className="pins-view h-full shrink grow flex flex-col gap-2 overflow-hidden">
      <h2 className="color-inverted px-2 py-1 flex flex-row gap-1 items-center font-bold">
        <p>ピン</p>
        <InlineIcon i={<VscPinned />} />
        {resolvedPins.length > 0 && <p className="text-sm">({resolvedPins.length})</p>}
        <button
          className="profile-close-button ml-auto shrink-0 px-1 flex flex-row items-center"
          title="パネルを閉じる"
          onClick={() => setShowPinsPanel(false)}
        >
          <InlineIcon i={<VscClose />} />
        </button>
      </h2>
      {content}
    </div>
  );
};
