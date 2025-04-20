import { BaseResult, ISystemService } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';
import { IPC_EVENTS } from '@evo/utils';

export class ElectronSystem extends BaseBridge implements ISystemService {
  async clearLocalData(): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.SYSTEM.CLEAN_LOCAL_DATA);
  }
}
