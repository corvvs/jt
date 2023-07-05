import { atom, useAtom } from 'jotai';

const actualColorThemes = ["light", "dark"] as const;
export type ActualColorTheme = typeof actualColorThemes[number];
export type ColorTheme = "system" | ActualColorTheme

const colorThemeAtom = atom<ColorTheme>("system");
const systemPreferredThemeAtom = atom<ActualColorTheme | null>(null);
const effectiveColorThemeAtom = atom<ActualColorTheme>(
  (get) => {
    const theme = get(colorThemeAtom);
    if (theme === "system") {
      return get(systemPreferredThemeAtom) || "dark";
    }
    return theme;
  },
);

function saveTheme(theme: ColorTheme) {
  localStorage.setItem("colorTheme", theme);
}

function loadTheme(): ColorTheme | null {
  const theme = localStorage.getItem("colorTheme");
  if (theme) {
    if (theme === "system") {
      return theme;
    } else if (actualColorThemes.includes(theme as any)) {
      return theme as ColorTheme;
    }
  }
  return null;
}

export const useColorTheme = () => {
  const [preferredColorTheme, setPreferredColorTheme] = useAtom(systemPreferredThemeAtom);
  const [rawColorTheme, setColorTheme] = useAtom(colorThemeAtom);
  const [colorTheme] = useAtom(effectiveColorThemeAtom);

  return {
    rawColorTheme,
    colorTheme,
    setColorTheme,
    preferredColorTheme,
    setPreferredColorTheme,
    loadTheme,
    saveTheme,
  };
}
