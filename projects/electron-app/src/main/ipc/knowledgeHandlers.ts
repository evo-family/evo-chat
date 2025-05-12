import { ipcMain } from 'electron';
import { managerService } from '../services/ManagerService';
import { IPC_EVENTS } from '@evo/utils';
import { BaseResult } from '@evo/types';
export async function setupKnowledgeHandlers() {
  const knowledgeService = (await managerService).knowledgeService;

  ipcMain.handle(
    IPC_EVENTS.KNOWLEDGE.DELETE,
    async (_, id: string): Promise<BaseResult<boolean>> => {
      return knowledgeService.knowledgeManager.delete(id);
    }
  );
}
