import { IPC_EVENTS } from '@evo/utils';
import { ipcMain } from 'electron';
import { ResourceService } from '../services/ResourceService';

export function setupSystemsHandlers() {
  /**
   * 清除本地所有数据
   */
  ipcMain.handle(IPC_EVENTS.SYSTEM.CLEAN_LOCAL_DATA, async () => {
    return await ResourceService.getInstance().cleanAll();
  });
}
