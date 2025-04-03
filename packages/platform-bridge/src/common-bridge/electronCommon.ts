import { EThemeMode, ICommonService } from "@evo/types";
import { BaseBridge } from "../common/baseBridge";
import { IPC_EVENTS } from "@evo/utils";


export class ElectronCommon extends BaseBridge implements ICommonService {
  openExternal =  (url: string, options?: any) => {
    window.__ELECTRON__.commonService.openExternal(url, options);
  };
  getTheme(): Promise<EThemeMode> {
    return window.__ELECTRON__.commonService.getTheme();
  }
  onThemeChange(callback: (theme: EThemeMode) => void): void {
    return window.__ELECTRON__.commonService.onThemeChange(callback);
  }

  async getVersion(): Promise<string> {
    const version = await window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.UPDATE.GET_VERSION);
    return version;
  }
}
