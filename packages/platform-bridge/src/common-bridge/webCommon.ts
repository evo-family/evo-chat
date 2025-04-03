import { EThemeMode, ICommonService } from "@evo/types";
import { BaseBridge } from "../common/baseBridge";
import { getSystemTheme } from "@evo/utils";

export class WebCommon extends BaseBridge implements ICommonService {
  getVersion(): Promise<string> {
    return Promise.resolve(process.env.PACKAGE_VERSION || '');
  }
  openExternal = (url: string, options?: any) => {};
  getTheme(): Promise<EThemeMode> {
    return Promise.resolve(getSystemTheme());
  }

  onThemeChange(callback: (theme: EThemeMode) => void): void {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

    const handleChange = (e: MediaQueryListEvent) => {
      callback(e.matches ? EThemeMode.Dark : EThemeMode.Light);
    };

    mediaQuery.addEventListener('change', handleChange);
  }
}
