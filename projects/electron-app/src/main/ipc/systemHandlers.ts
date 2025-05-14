import { IPC_EVENTS } from '@evo/utils';
import { ipcMain } from 'electron';
import { ResourceService } from '../services/ResourceService';
import { SystemService } from '../services/SystemService';

export function setupSystemsHandlers() {
  /**
   * 清除本地所有数据
   */
  ipcMain.handle(IPC_EVENTS.SYSTEM.CLEAN_LOCAL_DATA, async () => {
    return await ResourceService.getInstance().cleanAll();
  });

  /**
   * 获取系统LOG路径
   */
  ipcMain.handle(IPC_EVENTS.SYSTEM.GET_LOG_PATH, async () => {
    return SystemService.getInstance().getLogPath();
  });

  /**
   * 打开文件
   */
  ipcMain.handle(IPC_EVENTS.SYSTEM.OPEN_FILE, async (_, filePath: string) => {
    return SystemService.getInstance().openFile(filePath);
  });

  /**
   * 打开文件夹
   */
  ipcMain.handle(IPC_EVENTS.SYSTEM.OPEN_FOLDER, async (_, folderPath: string) => {
    return SystemService.getInstance().openFile(folderPath);
  });

  ipcMain.handle(IPC_EVENTS.SYSTEM.GET_NATIVE_THEME, async (event) => {
    return SystemService.getInstance().getTheme();
  });

  ipcMain.handle(IPC_EVENTS.SYSTEM.ON_NATIVE_THEME_CHANGE, async (event, params) => {
    return SystemService.getInstance().onThemeChange(params);
  });

  ipcMain.handle(IPC_EVENTS.SYSTEM.OPEN_EXTERNAL, async (event, url, options) => {
    SystemService.getInstance().openExternal(url, options);
  });

  ipcMain.handle(IPC_EVENTS.SYSTEM.GET_VERSION, () => {
    return SystemService.getInstance().getVersion();
  });

  /**
   * 获取当前操作系统类型
   */
  ipcMain.handle(IPC_EVENTS.SYSTEM.GET_OS_TYPE, () => {
    return process.platform;
  });
}
