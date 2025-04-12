import { EThemeMode, ICommonService, MobilePermissionType } from '@evo/types';
import { nativeTheme, shell } from 'electron';

export class CommonService implements ICommonService {
  openExternal(url: string, options?: any): void {
    shell.openExternal(url, options);
  }

  getVersion(): Promise<string> {
    throw new Error('Method not implemented.');
  }
  checkMobilePermission?(permissions: MobilePermissionType[]): Promise<boolean> {
    throw new Error('Method not implemented.');
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
