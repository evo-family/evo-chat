import { BaseResult, EThemeMode, ISystemService, MobilePermissionType } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';

export class MobileSystem extends BaseBridge implements ISystemService {
  clearLocalData(): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
  getLogPath(): Promise<BaseResult<string>> {
    throw new Error('Method not implemented.');
  }
  openFile(filePath: string): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
  openFolder(folderPath: string): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }

  getTheme(): Promise<EThemeMode> {
    return new Promise((resolve, reject) => {
      sendMessageToRN('getTheme');
      // @ts-ignore
      window.getTheme = (data) => {
        resolve(data as EThemeMode);
      };
    });
  }
  onThemeChange(callback: (theme: EThemeMode) => void): void {
    // @ts-ignore
    window.onThemeChange = (data) => {
      callback(data as EThemeMode);
    };
  }
  openExternal(url: string): void {
    sendMessageToRN('openExternal', { url });
  }

  getVersion(): Promise<string> {
    return new Promise((resolve, reject) => {
      sendMessageToRN('getAppVersion');
      // @ts-ignore
      window.getAppVersion = (data) => {
        resolve(data as string);
      };
    });
  }

  checkPermission(permissions: MobilePermissionType[]): Promise<boolean> {
    return new Promise((resolve, reject) => {
      sendMessageToRN('checkMobilePermission', { permissionArr: permissions });
      // @ts-ignore
      window.checkMobilePermission = (data: string) => {
        // data数组的长度和permissions的长度一致 即为同意了权限
        try {
          const dataArr = JSON.parse(data);
          if (dataArr.length === permissions.length) {
            resolve(true);
          } else {
            resolve(false);
          }
        } catch (error) {
          reject(error);
        }
      };
    });
  }
}

export const sendMessageToRN = (type: string, data?: any) => {
  const stringParam = JSON.stringify({
    type,
    data,
  });
  // @ts-ignore
  window?.ReactNativeWebView?.postMessage(stringParam);
};
