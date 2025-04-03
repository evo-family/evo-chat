import { IPC_EVENTS } from "./ipc";


/**
 * 检查更新
 */
export const checkForUpdate = () => {
  window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.UPDATE.CHECK);
};