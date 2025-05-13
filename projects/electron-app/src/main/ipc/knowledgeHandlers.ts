import { ipcMain } from 'electron';
import { managerService } from '../services/ManagerService';
import { IPC_EVENTS } from '@evo/utils';
import { BaseResult, IDeleteVectorParams } from '@evo/types';
export async function setupKnowledgeHandlers() {
  const knowledgeService = (await managerService).knowledgeService;

  ipcMain.handle(
    IPC_EVENTS.KNOWLEDGE.DELETE,
    async (_, id: string): Promise<BaseResult<boolean>> => {
      return knowledgeService.knowledgeManager.delete(id);
    }
  );

  ipcMain.handle(
    IPC_EVENTS.KNOWLEDGE.DELETE_VECTOR,
    async (_, params: IDeleteVectorParams): Promise<BaseResult<boolean>> => {
      return knowledgeService.knowledgeManager.deleteVector(params);
    }
  );
}
