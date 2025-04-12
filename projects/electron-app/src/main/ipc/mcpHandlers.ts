import { ipcMain } from 'electron';
import { IPC_EVENTS } from '@evo/utils';
import { BaseResult, IMcpCategoryMeta, IMcpMeta } from '@evo/types';
import { managerService } from '../services/ManagerService';

export function setupMcpHandlers() {
  const { MCPCategoryManager, MCPManager } = managerService.MCPService;
  // 分类相关处理器
  ipcMain.handle(
    IPC_EVENTS.MCP.CREATE_CATEGORY,
    async (_, meta: IMcpCategoryMeta): Promise<BaseResult<IMcpCategoryMeta>> => {
      return MCPCategoryManager.create(meta);
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.UPDATE_CATEGORY,
    async (_, meta: IMcpCategoryMeta): Promise<BaseResult<IMcpCategoryMeta>> => {
      return MCPCategoryManager.update(meta);
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.DELETE_CATEGORY,
    async (_, id: string): Promise<BaseResult<boolean>> => {
      return MCPCategoryManager.delete(id);
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.GET_CATEGORY_LIST,
    async (): Promise<BaseResult<IMcpCategoryMeta[]>> => {
      return MCPCategoryManager.getList();
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.GET_CATEGORY_BY_ID,
    async (_, id: string): Promise<BaseResult<IMcpCategoryMeta | null>> => {
      return MCPCategoryManager.getById(id);
    }
  );

  // MCP 项目相关处理器
  ipcMain.handle(
    IPC_EVENTS.MCP.CREATE_MCP,
    async (_, meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> => {
      return MCPManager.create(meta);
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.UPDATE_MCP,
    async (_, meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> => {
      return MCPManager.update(meta);
    }
  );

  ipcMain.handle(IPC_EVENTS.MCP.DELETE_MCP, async (_, id: string): Promise<BaseResult<boolean>> => {
    return MCPManager.delete(id);
  });

  ipcMain.handle(IPC_EVENTS.MCP.GET_MCP_LIST, async (): Promise<BaseResult<IMcpMeta[]>> => {
    return MCPManager.getList();
  });

  ipcMain.handle(
    IPC_EVENTS.MCP.GET_MCP_BY_ID,
    async (_, id: string): Promise<BaseResult<IMcpMeta | null>> => {
      return MCPManager.getById(id);
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.GET_MCP_LIST_BY_CATEGORY,
    async (_, categoryId: string): Promise<BaseResult<IMcpMeta[]>> => {
      return MCPManager.getListByCategoryId(categoryId);
    }
  );

  // 服务控制相关处理器
  // ipcMain.handle(IPC_EVENTS.MCP.START_SERVICE, async (): Promise<boolean> => {
  //   return McpManager.getInstance().startService();
  // });

  // ipcMain.handle(IPC_EVENTS.MCP.STOP_SERVICE, async (): Promise<boolean> => {
  //   return McpManager.getInstance().stopService();
  // });

  // ipcMain.handle(IPC_EVENTS.MCP.GET_SERVICE_STATUS, async (): Promise<boolean> => {
  //   return McpManager.getInstance().getServiceStatus();
  // });
}
