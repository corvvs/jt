import { useColorTheme } from "@/states/theme";
import { MultipleButtons } from "../lv1/MultipleButtons";
import { InlineIcon } from "../lv1/InlineIcon";
import { MdOutlineDarkMode, MdOutlineLightMode } from "react-icons/md";

/**
 * カラーテーマを設定するためのUI
 */
export const ThemeSelector = () => {
  const { rawColorTheme, setColorTheme, saveTheme } = useColorTheme();

  return (
    <MultipleButtons
      currentKey={rawColorTheme}
      items={[
        {
          key: "light",
          content: <div
            className="h-[1.5rem]"
          >
            <InlineIcon i={<MdOutlineLightMode />} />
            <span className="p-1">Light</span>
          </div>
        },
        {
          key: "system",
          content: <div
            className="h-[1.5rem]"
          >
            <span className="p-1">System</span>
          </div>
        },
        {
          key: "dark",
          content: <div
            className="h-[1.5rem]"
          >
            <InlineIcon i={<MdOutlineDarkMode />} />
            <span className="p-1">Dark</span>
          </div>
        },
      ]}
      onClick={(item) => {
        const theme = item.key;
        setColorTheme(theme)
        saveTheme(theme);
      }}
    />
  );
}
