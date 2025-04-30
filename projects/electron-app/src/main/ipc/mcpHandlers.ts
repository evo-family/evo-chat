import { BaseResult, IMcpCategoryMeta, IMcpMeta } from '@evo/types';
import { IPC_EVENTS, ResultUtil } from '@evo/utils';

import { ipcMain } from 'electron';
import { managerService } from '../services/ManagerService';

export async function setupMcpHandlers() {
  const { MCPCategoryManager, MCPManager, MCPClientManager } = (await managerService).MCPService;
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
  ipcMain.handle(
    IPC_EVENTS.MCP.START_SERVICE,
    async (_, mcp: IMcpMeta): Promise<BaseResult<boolean>> => {
      const res = await MCPClientManager.startClient(mcp);
      if (res.success) {
        return ResultUtil.success(true);
      } else {
        return ResultUtil.error(false);
      }
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.START_SERVICE_BY_MCP_ID,
    async (_, mcpId: string): Promise<BaseResult<boolean>> => {
      const res = await MCPClientManager.startClientByMcpId(mcpId);
      if (res.success) {
        return ResultUtil.success(true);
      } else {
        return ResultUtil.error(false);
      }
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.STOP_SERVICE,
    async (_, mcpId: string): Promise<BaseResult<boolean>> => {
      return await MCPClientManager.stopClient(mcpId);
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.GET_SERVICE_STATUS,
    async (_, mcpId: string): Promise<BaseResult<boolean>> => {
      return MCPClientManager.isClientRunning(mcpId);
    }
  );

  ipcMain.handle(IPC_EVENTS.MCP.GET_TOOLS, async (_, mcpId: string): Promise<BaseResult<any[]>> => {
    return MCPClientManager.getTools(mcpId);
  });

  ipcMain.handle(
    IPC_EVENTS.MCP.GET_MCP_PROMPT,
    async (_, mcpIds: string[], userPrompt: string): Promise<BaseResult<string>> => {
      return MCPClientManager.getMcpPrompt(mcpIds, userPrompt);
    }
  );

  ipcMain.handle(
    IPC_EVENTS.MCP.CALL_TOOL,
    async (_, mcpId: string, name: string, args: any): Promise<BaseResult<any>> => {
      return MCPClientManager.callTool(mcpId, name, args);
    }
  );
}
