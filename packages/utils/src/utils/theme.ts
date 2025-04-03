import { EThemeMode } from "@evo/types";
import { isElectron } from "./env";

/**
 * 获取系统主题色
 * @returns
 */
export const getSystemTheme = () => {
  // if (isElectron()) {
  //   // @ts-ignore
  //   return window?.electron?.getNativeTheme?.() === 'dark' ? EThemeMode.Dark : EThemeMode.Light;
  // }
  // 浏览器环境，使用媒体查询
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? EThemeMode.Dark : EThemeMode.Light;
};
