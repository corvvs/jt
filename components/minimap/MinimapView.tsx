import { MutableRefObject, useEffect, useRef, useState } from "react";
import { useAtomValue } from "jotai";
import { useVisibleItems } from "@/states/json";
import { filterMapsAtom } from "@/states/manipulation/query";
import { pinMapAtom } from "@/states/pins";
import { useColorTheme } from "@/states/theme";
import { ColorSets } from "@/libs/theme";
import { minimapViewportAtom } from "@/states/minimap";

/**
 * ミニマップ.
 *
 * 可視行 (visibleItems) を縦に縮約した帯へ, 検索マッチ・ピン・diff status を投影する.
 * 縦軸は「可視行の index」= react-window のスクロール座標と一致するため,
 * クリック位置 → visibleIndex → scrollToItem がそのまま噛み合う.
 *
 * マーカーはすべて既存データ由来で追加計算は不要:
 *   - マッチ: filterMaps.matched[item.index]   (全体 index キー)
 *   - ピン:   pinMap.has(item.elementKey)        (キーパス同定)
 *   - diff:   item.diff?.status                   (行フィールド)
 *
 * 描画は canvas 1 枚. 数万行でも DOM 要素を増やさない.
 */
export const MinimapView = (props: {
  itemViewRef: MutableRefObject<any>;
}) => {
  const visibles = useVisibleItems();
  const filterMaps = useAtomValue(filterMapsAtom);
  const pinMap = useAtomValue(pinMapAtom);
  const viewport = useAtomValue(minimapViewportAtom);
  const { colorTheme } = useColorTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 0, height: 0 });

  // 親 (w-4 の帯) のサイズに追従する. AutoSizer と同じ発想.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) { return; }
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) { return; }
      const { width, height } = entry.contentRect;
      setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    const { width, height } = size;
    if (width <= 0 || height <= 0) { return; }

    // 高 DPI 対応: 実解像度は dpr 倍にし, 描画は論理座標で行う
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    const ctx = canvas.getContext("2d");
    if (!ctx) { return; }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, width, height);

    // visibles が無い/空でも canvas は常にマウントしておく (ResizeObserver の監視対象を
    // 外さないため). 描くものが無いときは clear だけして抜ける.
    const items = visibles?.visibleItems;
    if (!items || items.length === 0) { return; }
    const n = items.length;

    // colorTheme ("light"|"dark") から色を直接引く (getComputedStyle のタイミング問題を避ける).
    // マーカー色はいずれも hex 文字列なので canvas の fillStyle にそのまま渡せる.
    const colors = ColorSets[colorTheme];
    const matchColor = colors["matched-foreground"] as string;
    const pinColor = colors["pin-glyph"] as string;
    const addedColor = colors["diff-added-foreground"] as string;
    const removedColor = colors["diff-removed-foreground"] as string;
    const changedColor = colors["diff-changed-foreground"] as string;

    // 行 i の縦位置と描画高. 行数 > 縦画素なら 1px, それ未満なら太いバー (隙間なく詰める).
    const rowH = height / n;
    const drawH = Math.max(1, Math.ceil(rowH));
    const yOf = (i: number) => Math.floor((i / n) * height);

    // 1) diff: 全幅の帯 (行背景に相当). added/removed/changed のみ. child_changed は控えめに省く.
    for (let i = 0; i < n; i++) {
      const status = items[i].diff?.status;
      let c: string | null = null;
      if (status === "added") { c = addedColor; }
      else if (status === "removed") { c = removedColor; }
      else if (status === "changed") { c = changedColor; }
      if (!c) { continue; }
      ctx.fillStyle = c;
      ctx.fillRect(0, yOf(i), width, drawH);
    }

    // 2) マッチ: 左レーンの点 (diff 帯の上に重ねても左端に出るので視認できる)
    const laneW = Math.max(2, Math.floor(width * 0.45));
    ctx.fillStyle = matchColor;
    if (filterMaps) {
      for (let i = 0; i < n; i++) {
        if (filterMaps.matched[items[i].index]) {
          ctx.fillRect(0, yOf(i), laneW, drawH);
        }
      }
    }

    // 3) ピン: 右レーンの点
    ctx.fillStyle = pinColor;
    for (let i = 0; i < n; i++) {
      if (pinMap.has(items[i].elementKey)) {
        ctx.fillRect(width - laneW, yOf(i), laneW, drawH);
      }
    }

    // 4) 現在の表示範囲を示す枠 (マーカーの上に半透明で重ねる).
    // viewport の index は onItemsRendered 由来の可視 index. 念のため現在の n で clamp する.
    if (viewport) {
      const start = Math.max(0, Math.min(viewport.startIndex, n - 1));
      const stop = Math.max(start, Math.min(viewport.stopIndex, n - 1));
      const vy1 = Math.floor((start / n) * height);
      const vy2 = Math.min(height, Math.ceil(((stop + 1) / n) * height));
      const vh = Math.max(2, vy2 - vy1);
      const foreground = colors["foreground"] as string;
      ctx.save();
      ctx.globalAlpha = 0.16;
      ctx.fillStyle = foreground;
      ctx.fillRect(0, vy1, width, vh);
      ctx.restore();
      ctx.strokeStyle = foreground;
      ctx.lineWidth = 1;
      ctx.strokeRect(0.5, vy1 + 0.5, width - 1, Math.max(1, vh - 1));
    }
  }, [visibles, filterMaps, pinMap, viewport, colorTheme, size]);

  const scrubTo = (clientY: number) => {
    if (!visibles) { return; }
    const canvas = canvasRef.current;
    if (!canvas) { return; }
    const rect = canvas.getBoundingClientRect();
    if (rect.height <= 0) { return; }
    const n = visibles.visibleItems.length;
    if (n === 0) { return; }
    const y = clientY - rect.top;
    const target = Math.min(n - 1, Math.max(0, Math.round((y / rect.height) * n)));
    props.itemViewRef.current?.scrollToItem(target, "center");
  };

  // クリックで単発ジャンプ, ドラッグで連続スクラブ.
  // ドラッグ中は canvas 外に出ても追従できるよう document でリッスンし, mouseup で解除する.
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas || !visibles) { return; }
    const rect = canvas.getBoundingClientRect();
    const n = visibles.visibleItems.length;
    if (rect.height <= 0 || n === 0) { return; }
    const y = e.clientY - rect.top;

    // カーソルが現在の枠の内側なら「枠を掴んで相対ドラッグ」: 掴んだ位置と枠中心の
    // オフセットを保持し, 掴んだ瞬間に枠が飛ばないようにする. 枠の外 (トラック) を
    // 押した場合は従来どおりその位置へジャンプする.
    let grabOffset = 0;
    if (viewport) {
      const start = Math.max(0, Math.min(viewport.startIndex, n - 1));
      const stop = Math.max(start, Math.min(viewport.stopIndex, n - 1));
      const vy1 = (start / n) * rect.height;
      const vy2 = ((stop + 1) / n) * rect.height;
      if (y >= vy1 && y <= vy2) {
        grabOffset = y - (vy1 + vy2) / 2;
      } else {
        scrubTo(e.clientY);
      }
    } else {
      scrubTo(e.clientY);
    }

    const onMove = (ev: MouseEvent) => scrubTo(ev.clientY - grabOffset);
    const onUp = () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseup", onUp);
    };
    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseup", onUp);
  };

  return (
    <div ref={containerRef} className="minimap-body w-full h-full relative overflow-hidden">
      <canvas
        ref={canvasRef}
        className="minimap-canvas cursor-pointer"
        onMouseDown={handleMouseDown}
      />
    </div>
  );
};
