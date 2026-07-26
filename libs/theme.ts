import { ActualColorTheme, ColorTheme } from "@/states/theme";
import _ from "lodash";

type ColorHex = `#${string}`;
type ColorRGB = [number, number, number];
type ColorRGBA = [number, number, number, number];

type ColorValue =
  | string
  | ColorHex
  | ColorRGB
  | ColorRGBA;

const ColorSetKeys = [
  "foreground",
  "foreground-secondary",
  "foreground-bad",
  "background",
  "background-secondary",
  "foreground-schema",
  "foreground-key",
  "foreground-string",
  "foreground-number",
  "foreground-true",
  "foreground-false",
  "background-key-0",
  "background-key-1",
  "background-key-2",
  "background-key-3",
  "background-key-4",
  "background-textarea",
  "matched-foreground",
  "matched-row",
  "narrowing-base",
  "selected-row",
  "line-number",
  "pin-glyph",
  "diff-added-row",
  "diff-removed-row",
  "diff-changed-row",
  "diff-added-foreground",
  "diff-removed-foreground",
  "diff-changed-foreground",
  "highlight-0-row",
  "highlight-1-row",
  "highlight-2-row",
  "highlight-3-row",
  "highlight-4-row",
  "highlight-5-row",
  "highlight-6-row",
  "highlight-7-row",
  "highlight-0-marker",
  "highlight-1-marker",
  "highlight-2-marker",
  "highlight-3-marker",
  "highlight-4-marker",
  "highlight-5-marker",
  "highlight-6-marker",
  "highlight-7-marker",
] as const;

type ColorSet = {
  [Key in typeof ColorSetKeys[number]]: ColorValue;
};

export const ColorSets: {
    [Theme in ActualColorTheme]: ColorSet;
} = {
  light: {
    "foreground":           "#504b55",
    "foreground-secondary": "#807d83",
    "foreground-bad":       "#e22f59",
    "background":           "#e8edec",
    "background-secondary": "#d4d4d4",
    "foreground-schema":    "#888",
    "foreground-key":       "#3c39d5",
    "foreground-string":    "#875731",
    "foreground-number":    "#468f46",
    "foreground-true":      "#378e51",
    "foreground-false":     "#6d7670",
    "background-key-0":     "#e6e9d7",
    "background-key-1":     "#cee3c9",
    "background-key-2":     "#c6dddf",
    "background-key-3":     "#e3d0e7",
    "background-key-4":     "#d1d7e7",
    "background-textarea":  "#e3e8e8",
    "matched-foreground":   "#2a86d6",
    "matched-row":          "#d2e1ee",
    "narrowing-base":       "#9e62f3",
    "selected-row":         "#c6f1c8",
    "line-number":          "royalblue",
    "pin-glyph":            "#3c39d5",
    "diff-added-row":          "#d6ecd4",
    "diff-removed-row":        "#f2dad8",
    "diff-changed-row":        "#f0e7cb",
    "diff-added-foreground":   "#2e7d43",
    "diff-removed-foreground": "#c24444",
    "diff-changed-foreground": "#9a7b1c",
    // ハイライトルールのパレット (row = 行背景の淡色 / marker = 左バー・ミニマップの濃色).
    // 明度は row が diff-*-row, marker が diff-*-foreground の帯に合わせてある
    "highlight-0-row":    "#f0d6d6", // red
    "highlight-1-row":    "#f2e2cc", // orange
    "highlight-2-row":    "#f1ecc9", // yellow
    "highlight-3-row":    "#d8ecd6", // green
    "highlight-4-row":    "#d2eae8", // teal
    "highlight-5-row":    "#d9def5", // blue
    "highlight-6-row":    "#e6d8ee", // purple
    "highlight-7-row":    "#f0d7e6", // pink
    "highlight-0-marker": "#d03535",
    "highlight-1-marker": "#cc6e0f",
    "highlight-2-marker": "#b39a10",
    "highlight-3-marker": "#229a47",
    "highlight-4-marker": "#12968d",
    "highlight-5-marker": "#3556e0",
    "highlight-6-marker": "#8a35c9",
    "highlight-7-marker": "#cc3392",
  },

  dark: {
    "foreground":           "#eee7f7",
    "foreground-secondary": "#66606e",
    "foreground-bad":       "#ea5477",
    "background":           "#1d1d1f",
    "background-secondary": "#33333a",
    "foreground-schema":    "#b3b3b3",
    "foreground-key":       "#3c7aff",
    "foreground-string":    "#eaa18b",
    "foreground-number":    "#7cda65",
    "foreground-true":      "#73ff9d",
    "foreground-false":     "#b9d6b1",
    "background-key-0":     "#2a2c34",
    "background-key-1":     "#373a30",
    "background-key-2":     "#3b313b",
    "background-key-3":     "#323b37",
    "background-key-4":     "#3d3432",
    "background-textarea":  "#303030",
    "matched-foreground":   "#2a86d6",
    "matched-row":          "#2f463e",
    "narrowing-base":       "#5822a3",
    "selected-row":         "#096865",
    "line-number":          "#858dff",
    "pin-glyph":            "#8ab4ff",
    "diff-added-row":          "#2c4632",
    "diff-removed-row":        "#4a2e2e",
    "diff-changed-row":        "#4a4028",
    "diff-added-foreground":   "#73d98a",
    "diff-removed-foreground": "#e88787",
    "diff-changed-foreground": "#e0c25e",
    "highlight-0-row":    "#4a2d2d", // red
    "highlight-1-row":    "#4a3a29", // orange
    "highlight-2-row":    "#494327", // yellow
    "highlight-3-row":    "#2d4732", // green
    "highlight-4-row":    "#264543", // teal
    "highlight-5-row":    "#2d3a52", // blue
    "highlight-6-row":    "#3e2e4c", // purple
    "highlight-7-row":    "#4a2c3f", // pink
    "highlight-0-marker": "#f26d6d",
    "highlight-1-marker": "#f0993d",
    "highlight-2-marker": "#e8c93e",
    "highlight-3-marker": "#4fe07c",
    "highlight-4-marker": "#35d9cd",
    "highlight-5-marker": "#5f8dfa",
    "highlight-6-marker": "#b370f0",
    "highlight-7-marker": "#f070c2",
  },
}

function colorSetForTheme(theme: ColorTheme): ColorSet {
  if (theme === "system") {
    return colorSetForTheme("light");
  }
  return ColorSets[theme];
}

function colorValueToCSSValue(cv: ColorValue) {
  if (typeof cv === "string") {
    return cv;
  } else if (cv.length === 3) {
    return `rgb(${cv[0]}, ${cv[1]}, ${cv[2]})`;
  } else {
    return `rgba(${cv[0]}, ${cv[1]}, ${cv[2]}, ${cv[3]})`;
  }
}

export function reflectColorTheme(theme: ColorTheme) {
  if (!document) {
    return;
  }
  const colorSet = colorSetForTheme(theme);
  const root = document.documentElement;
  console.log("reflecting", theme, colorSet);
  _.each(colorSet, (value, key) => {
    root.style.setProperty(`--${key}`, colorValueToCSSValue(value));
  });
}
