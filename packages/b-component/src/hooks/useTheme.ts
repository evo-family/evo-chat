import { useSettingSelector } from "@evo/data-store"
import { EThemeMode } from "@evo/types";
import { getSystemTheme } from "@evo/utils";
import { useCreation, useDebounceEffect } from "ahooks";
import { useMemo, useState } from "react";

/**
 * 获取当前的主图
 * @returns
 */
export const useTheme = () => {

  const [resultTheme, setResultTheme] = useState<EThemeMode>()
  const theme = useSettingSelector(s => s?.theme);

  useDebounceEffect(
    () => {
      if (theme === EThemeMode.System) {
       setResultTheme(getSystemTheme());
       return;
      }
      setResultTheme(theme)
    },
    [theme],
    {
      wait: 150,
    },
  );

  return resultTheme;
}
