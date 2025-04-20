import { IPC_EVENTS } from '@evo/utils';
import { ipcMain } from 'electron';
import { managerService } from '../services/ManagerService';

export async function setupCliHandlers() {
  const cliService = (await managerService).MCPService.cliManager;
  ipcMain.handle(IPC_EVENTS.CLI.CHECK_BUN_COMMAND, async () => {
    return await cliService.checkBunCommand();
  });
  ipcMain.handle(IPC_EVENTS.CLI.CHECK_UV_COMMAND, async () => {
    return await cliService.checkUvCommand();
  });

  ipcMain.handle(IPC_EVENTS.CLI.CHECK_NPX_COMMAND, async () => {
    return await cliService.checkNpxCommand();
  });

  ipcMain.handle(IPC_EVENTS.CLI.GET_COMMAND_PATH, async (_, command: string) => {
    return await cliService.getCommandPath(command);
  });

  ipcMain.handle(IPC_EVENTS.CLI.INSTALL_COMMAND, async (_, command: string) => {
    return await cliService.installCommand(command);
  });
}
