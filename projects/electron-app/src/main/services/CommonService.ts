import { EThemeMode, ICommonService } from "@evo/types";
import { nativeTheme } from "electron";


export class CommonService implements ICommonService {

  constructor() {
  }
  onThemeChange(callback: (theme: EThemeMode) => void): void {
    nativeTheme.on('updated', () => {
      const theme = nativeTheme.shouldUseDarkColors ? EThemeMode.Dark : EThemeMode.Light;
      callback(theme);
    });
  }

  async getTheme(): Promise<EThemeMode> {
    const theme = nativeTheme.shouldUseDarkColors ? EThemeMode.Dark : EThemeMode.Light;
    return Promise.resolve(theme);
  };
}