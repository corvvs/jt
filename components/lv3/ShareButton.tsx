import React from "react";
import { VscLink } from "react-icons/vsc";
import { useStore } from "jotai";
import { toast } from "react-toastify";
import { InlineIcon } from "@/components/lv1/InlineIcon";
import { useJSON } from "@/states";
import { useDataFormat } from "@/states/config";
import { useDiffTarget } from "@/states/diff";
import { collectSharedViewState } from "@/states/share";
import { ClipboardAccess } from "@/libs/sideeffect";
import {
  SharePayloadV1,
  SHARE_URL_MAX_LENGTH,
  SHARE_URL_WARN_LENGTH,
  buildShareUrl,
  encodeSharePayload,
  isCompressionSupported,
} from "@/libs/share";

/**
 * ドキュメント本文と現在のビュー状態 (ナローイング・クエリ・フォールド) を
 * URL フラグメントに圧縮した共有リンクを生成し, クリップボードにコピーする.
 * diff モードのビュー共有は対象外.
 */
export const ShareButton = () => {
  const { document } = useJSON();
  const { dataFormat } = useDataFormat();
  const { diffTarget } = useDiffTarget();
  const store = useStore();

  const disabled = !document || !!diffTarget || !isCompressionSupported();

  const onClick = async () => {
    if (!document) { return; }
    try {
      const payload: SharePayloadV1 = {
        v: 1,
        doc: {
          name: document.name ?? "",
          format: dataFormat,
          json_string: document.json_string,
        },
        view: collectSharedViewState(store),
      };
      const encoded = await encodeSharePayload(payload);
      const url = buildShareUrl(window.location.origin, encoded);
      const kb = (url.length / 1024).toFixed(1);
      if (url.length > SHARE_URL_MAX_LENGTH) {
        toast.error(`共有URLが大きすぎます (${kb}KB)`);
        return;
      }
      await ClipboardAccess.copyText(url);
      toast(url.length > SHARE_URL_WARN_LENGTH
        ? `共有URLをコピーしました (${kb}KB) — 大きいため貼り付け先によっては切り詰められる可能性があります`
        : `共有URLをコピーしました (${kb}KB)`);
    } catch (e) {
      console.error("Failed to build share URL:", e);
      toast.error("共有URLの生成に失敗しました");
    }
  };

  return (
    <button
      className="flippable flex flex-row items-center px-2 whitespace-nowrap break-keep"
      onClick={onClick}
      disabled={disabled}
    >
      <InlineIcon i={<VscLink />} />
      <span>Share</span>
    </button>
  );
};
