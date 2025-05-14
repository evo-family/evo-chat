import { BaseResult, EThemeMode, ISystemService, MobilePermissionType } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';
import { IPC_EVENTS } from '@evo/utils';

export class ElectronSystem extends BaseBridge implements ISystemService {
  async getOsType(): Promise<'darwin' | 'win32' | 'linux'> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.GET_OS_TYPE);
  }
  checkPermission(permissions: MobilePermissionType[]): Promise<Boolean> {
    throw new Error('Method not implemented.');
  }
  openExternal = (url: string, options?: any) => {
    window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.OPEN_EXTERNAL, url, options);
  };
  getTheme(): Promise<EThemeMode> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.GET_NATIVE_THEME);
  }
  onThemeChange(callback: (theme: EThemeMode) => void): void {
    window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.ON_NATIVE_THEME_CHANGE, callback);
  }

  async getVersion(): Promise<string> {
    const version = await window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.GET_VERSION);
    return version;
  }

  async openFile(filePath: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.OPEN_FILE, filePath);
  }

  async openFolder(folderPath: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.OPEN_FOLDER, folderPath);
  }
  async getLogPath(): Promise<BaseResult<string>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.GET_LOG_PATH);
  }
  async clearLocalData(): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.CLEAN_LOCAL_DATA);
  }
}
