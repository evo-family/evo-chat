import {
  BaseResult,
  IMCPCallToolResponse,
  IMcpCategoryMeta,
  IMcpMeta,
  IMcpService,
} from '@evo/types';
import { BaseBridge } from '../common/baseBridge';
import { IPC_EVENTS } from '@evo/utils';

export class ElectronMcp extends BaseBridge implements IMcpService {
  async callTool(
    mcpId: string,
    name: string,
    args: any
  ): Promise<BaseResult<IMCPCallToolResponse>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.CALL_TOOL, mcpId, name, args);
  }
  async getMcpPrompt(mcpIds: string[], userPrompt: string): Promise<BaseResult<string>> {
    return window.__ELECTRON__.ipcRenderer.invoke(
      IPC_EVENTS.MCP.GET_MCP_PROMPT,
      mcpIds,
      userPrompt
    );
  }
  // 分类相关方法
  async createCategory(meta: Partial<IMcpCategoryMeta>): Promise<BaseResult<IMcpCategoryMeta>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.CREATE_CATEGORY, meta);
  }

  async updateCategory(meta: IMcpCategoryMeta): Promise<BaseResult<IMcpCategoryMeta>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.UPDATE_CATEGORY, meta);
  }

  async deleteCategory(id: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.DELETE_CATEGORY, id);
  }

  async getCategoryList(): Promise<BaseResult<IMcpCategoryMeta[]>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.GET_CATEGORY_LIST);
  }

  async getCategoryById(id: string): Promise<BaseResult<IMcpCategoryMeta | null>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.GET_CATEGORY_BY_ID, id);
  }

  // MCP 项目相关方法
  async createMcp(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.CREATE_MCP, meta);
  }

  async updateMcp(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.UPDATE_MCP, meta);
  }

  async deleteMcp(id: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.DELETE_MCP, id);
  }

  async getMcpList(): Promise<BaseResult<IMcpMeta[]>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.GET_MCP_LIST);
  }

  async getMcpById(id: string): Promise<BaseResult<IMcpMeta | null>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.GET_MCP_BY_ID, id);
  }

  async getMcpListByCategoryId(categoryId: string): Promise<BaseResult<IMcpMeta[]>> {
    return window.__ELECTRON__.ipcRenderer.invoke(
      IPC_EVENTS.MCP.GET_MCP_LIST_BY_CATEGORY,
      categoryId
    );
  }

  // 服务控制方法
  async startService(mcp: IMcpMeta): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.START_SERVICE, mcp);
  }

  async startClientByMcpId(mcpId: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.START_SERVICE_BY_MCP_ID, mcpId);
  }

  async stopService(mcpId: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.STOP_SERVICE, mcpId);
  }

  async getServiceStatus(mcpId: string): Promise<BaseResult<boolean>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.GET_SERVICE_STATUS, mcpId);
  }

  async getTools(mcpId: string): Promise<BaseResult<any[]>> {
    return window.__ELECTRON__.ipcRenderer.invoke(IPC_EVENTS.MCP.GET_TOOLS, mcpId);
  }
}
