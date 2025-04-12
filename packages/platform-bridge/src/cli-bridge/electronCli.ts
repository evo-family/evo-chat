import { BaseResult, ICliService } from '@evo/types';
import { BaseBridge } from '../common/baseBridge';
import { IPC_EVENTS } from '@evo/utils';

export class ElectronCli extends BaseBridge implements ICliService {
  async checkBunCommand(): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.CLI.CHECK_BUN_COMMAND);
  }

  async checkUvCommand(): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.CLI.CHECK_UV_COMMAND);
  }

  async getCommandPath(command: string): Promise<BaseResult<string | null>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.CLI.GET_COMMAND_PATH, command);
  }

  async installCommand(command: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.CLI.INSTALL_COMMAND, command);
  }
}
