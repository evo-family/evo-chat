import { IMcpService } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';
import { IPC_EVENTS } from '@evo/utils';

export class ElectronMcp extends BaseBridge implements IMcpService {
  async startService(): Promise<boolean> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.START_SERVICE);
  }

  async stopService(): Promise<boolean> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.STOP_SERVICE);
  }

  async getServiceStatus(): Promise<boolean> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.GET_SERVICE_STATUS);
  }
}
