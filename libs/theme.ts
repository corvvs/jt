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
] as const;

type ColorSet = {
  [Key in typeof ColorSetKeys[number]]: ColorValue;
};

const ColorSets: {
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
