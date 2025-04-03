import { EThemeMode, ICommonService } from "@evo/types";
import { BaseBridge } from "../common/baseBridge";


export class MobileCommon extends BaseBridge implements ICommonService {
  getVersion(): Promise<string> {
    throw new Error("Method not implemented.");
  }
  getTheme(): Promise<EThemeMode> {
    return new Promise((resolve, reject) => {
      sendMessageToRN('getTheme');
      // @ts-ignore
      window.getTheme = (data) => {
        resolve(data as EThemeMode);
      }
    });
  }
  onThemeChange(callback: (theme: EThemeMode) => void): void {
    // @ts-ignore
    window.onThemeChange = (data) => {
      callback(data as EThemeMode);
    }
  }
  openExternal(url: string): void {
    sendMessageToRN('openExternal', {url});
  }
  getImageOrFile(): Promise<string | []> {
    return new Promise((resolve, reject) => {
      sendMessageToRN('getImageOrFile');
      // @ts-ignore
      window.getImageOrFile = (data) => {
        resolve(data as string | []);
      }
    });
  }
}

export const sendMessageToRN = (type: string, data?: any) => {
  const stringParam = JSON.stringify({
    type,
    data,
  })
  // @ts-ignore
  window?.ReactNativeWebView?.postMessage(stringParam)
}
