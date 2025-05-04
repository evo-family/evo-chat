import { EThemeMode, MobilePermissionType, ISystemService, BaseResult } from '@evo/types';
import { ResultUtil } from '@evo/utils';
import { app, nativeTheme, shell } from 'electron';
import { getLogPath } from '../utils/pathsUtil';

export class SystemService {
  private static instance: SystemService;
  static getInstance(): SystemService {
    if (!SystemService.instance) {
      SystemService.instance = new SystemService();
    }
    return SystemService.instance;
  }

  async getLogPath(): Promise<BaseResult<string>> {
    return ResultUtil.success(getLogPath());
  }
  async openFile(filePath: string): Promise<BaseResult<boolean>> {
    try {
      await shell.openPath(filePath);
      return ResultUtil.success(true);
    } catch (error) {
      return ResultUtil.error('打开文件失败');
    }
  }

  async openFolder(folderPath: string): Promise<BaseResult<boolean>> {
    try {
      await shell.openPath(folderPath);
      return ResultUtil.success(true);
    } catch (error) {
      return ResultUtil.error('打开文件夹失败');
    }
  }

  async openExternal(url: string, options?: any) {
    shell.openExternal(url, options);
  }

  getVersion(): string {
    return app.getVersion();
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
  }
}
