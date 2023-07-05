import { reflectColorTheme } from "@/libs/theme";
import { ColorTheme, useColorTheme } from "@/states/theme";
import { useEffect } from "react";

export const ThemeObserver = () => {
  const {
    loadTheme,
    setColorTheme,
    colorTheme,
    preferredColorTheme,
    setPreferredColorTheme,
  } = useColorTheme();

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    setPreferredColorTheme(mediaQuery.matches ? 'dark' : 'light');

    const handler = () => setPreferredColorTheme(mediaQuery.matches ? 'dark' : 'light');
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') { return; }
    const theme: ColorTheme = loadTheme() || "system";
    console.log("setting", theme);
    setColorTheme(theme);
  }, []);

  console.log("preferredColorTheme", preferredColorTheme);
  reflectColorTheme(colorTheme);
  return <></>
};
