import { BaseResult, EThemeMode, ISystemService, MobilePermissionType } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';

export class WebSystem extends BaseBridge implements ISystemService {
  getTheme(): Promise<EThemeMode> {
    throw new Error('Method not implemented.');
  }
  onThemeChange(callback: (theme: EThemeMode) => void): void {
    throw new Error('Method not implemented.');
  }

  openExternal(url: string, options?: any): void {
    throw new Error('Method not implemented.');
  }

  getVersion(): Promise<string> {
    return Promise.resolve('v1.0.0');
  }
  checkPermission(permissions: MobilePermissionType[]): Promise<Boolean> {
    throw new Error('Method not implemented.');
  }
  openFile(filePath: string): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
  openFolder(folderPath: string): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
  getLogPath(): Promise<BaseResult<string>> {
    throw new Error('Method not implemented.');
  }
  clearLocalData(): Promise<BaseResult<boolean>> {
    throw new Error('Method not implemented.');
  }
}
