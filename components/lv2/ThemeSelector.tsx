import { useEffect, useRef, useState } from "react";
import { MdDarkMode, MdLightMode, MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";
import { ColorTheme, useColorTheme } from "@/states/theme";
import { useTransientBackdrop } from "@/features/TransientBackdrop";
import { useIsomorphicLayoutEffect } from "@/hooks/useIsomorphicLayoutEffect";

/**
 * Auto 行のアイコン.
 *
 * Light/Dark を 45 度で切って半々にする案は 16px では成立しない
 * (三日月は質量が細い弧に偏るため, 斜めに切ると尻尾しか残らない).
 * 切らずに, 塗りの Sun を左上・塗りの Moon を右下へ縮小して重ねる.
 * 塗り版は線画版と同じ図形なので, Light 行・Dark 行との対応も保たれる.
 */
const ThemeAutoIcon = () => (
  <span className="theme-auto-icon">
    <MdLightMode />
    <MdDarkMode />
  </span>
);

const ThemeModes: {
  key: ColorTheme;
  label: string;
  icon: JSX.Element;
}[] = [
  { key: "light", label: "Light", icon: <MdOutlineLightMode /> },
  { key: "system", label: "Auto", icon: <ThemeAutoIcon /> },
  { key: "dark", label: "Dark", icon: <MdOutlineDarkMode /> },
];

/**
 * カラーテーマを設定するためのUI.
 *
 * 通常は「実効テーマ (今まさに適用されている light/dark)」のアイコン1つだけを出し,
 * 押下で Light / Auto / Dark の縦メニューを開く.
 * Auto を選んでいる場合はシステム設定を解決した結果が出るので,
 * 「Auto かつシステムが dark」と「Dark を明示選択」は見た目では区別されない.
 */
export const ThemeSelector = () => {
  const { rawColorTheme, colorTheme, setColorTheme, saveTheme } = useColorTheme();
  const [isOpen, setIsOpen] = useState(false);
  // バックドロップを載せる行 (hover していない間は選択中の行に常駐する)
  const [restingElement, setRestingElement] = useState<HTMLElement | null>(null);
  // 文字色を反転させる行. backdrop が今どこに居るかと一致させる
  const [hoveredKey, setHoveredKey] = useState<ColorTheme | null>(null);
  const rowsRef = useRef(new Map<ColorTheme, HTMLElement>());
  const wrapperRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const { handleMouseEnter, handleMouseLeave, backdrop } = useTransientBackdrop({
    axis: "y",
    restingElement,
  });

  const activeKey = hoveredKey ?? rawColorTheme;

  // 行の DOM が出入りした後に定位置を決める (開閉と選択変更の両方で走る).
  // ペイント前に走らせないと, メニューが出た後に一拍おいて選択行がライトアップされる
  useIsomorphicLayoutEffect(() => {
    setRestingElement(isOpen ? (rowsRef.current.get(rawColorTheme) ?? null) : null);
  }, [isOpen, rawColorTheme]);

  const close = () => {
    setIsOpen(false);
    setHoveredKey(null);
  };

  // メニュー外のクリックで閉じる
  useEffect(() => {
    if (!isOpen) { return; }
    const handleMouseDown = (event: MouseEvent) => {
      if (wrapperRef.current?.contains(event.target as Node)) { return; }
      setIsOpen(false);
    };
    document.addEventListener("mousedown", handleMouseDown);
    return () => document.removeEventListener("mousedown", handleMouseDown);
  }, [isOpen]);

  // Escape で閉じる.
  // ラッパーの onKeyDown ではなく document の捕捉フェーズで拾う:
  // フォーカスがトリガー上にあるとは限らない (macOS のブラウザはクリックでボタンに
  // フォーカスを移さないことがある) ため, フォーカス位置に依存させない.
  // 捕捉フェーズで止めるので, グローバルショートカット (Esc でナローイング解除) にも奪われない.
  useEffect(() => {
    if (!isOpen) { return; }
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") { return; }
      event.stopPropagation();
      setIsOpen(false);
      setHoveredKey(null);
      triggerRef.current?.focus();
    };
    document.addEventListener("keydown", handleKeyDown, true);
    return () => document.removeEventListener("keydown", handleKeyDown, true);
  }, [isOpen]);

  const select = (key: ColorTheme) => {
    setColorTheme(key);
    saveTheme(key);
    close();
  };

  // title/aria-label は「実効テーマ」ではなく「選択」を述べる.
  // Auto はそれだけでは今の見た目が分からないので, 解決結果も添える.
  const themeLabel = colorTheme === "dark" ? "Dark" : "Light";
  const triggerTitle = rawColorTheme === "system"
    ? `テーマ: Auto (システム設定: ${themeLabel})`
    : `テーマ: ${themeLabel}`;

  return (
    <div
      ref={wrapperRef}
      className="theme-selector relative"
    >
      <button
        ref={triggerRef}
        className={`menu-toggle-button theme-selector-trigger ${isOpen ? "is-toggled" : "is-not-toggled"}`}
        onClick={() => (isOpen ? close() : setIsOpen(true))}
        title={triggerTitle}
        aria-label={triggerTitle}
        aria-haspopup="menu"
        aria-expanded={isOpen}
      >
        <span className="theme-trigger-icon">
          {colorTheme === "dark" ? <MdOutlineDarkMode /> : <MdOutlineLightMode />}
        </span>
      </button>

      {isOpen && (
        <div
          className="theme-menu flex flex-col text-base"
          role="menu"
          onMouseLeave={() => {
            setHoveredKey(null);
            handleMouseLeave();
          }}
        >
          {backdrop}

          {ThemeModes.map((mode) => (
            <button
              key={mode.key}
              ref={(el) => {
                if (el) {
                  rowsRef.current.set(mode.key, el);
                } else {
                  rowsRef.current.delete(mode.key);
                }
              }}
              className={`theme-menu-row ${activeKey === mode.key ? "is-on" : ""}`}
              role="menuitemradio"
              aria-checked={rawColorTheme === mode.key}
              onMouseEnter={(e) => {
                setHoveredKey(mode.key);
                handleMouseEnter(e);
              }}
              onFocus={(e) => {
                setHoveredKey(mode.key);
                handleMouseEnter(e);
              }}
              onClick={() => select(mode.key)}
            >
              <span className="theme-menu-label">{mode.label}</span>
              <span className="theme-menu-icon">{mode.icon}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
