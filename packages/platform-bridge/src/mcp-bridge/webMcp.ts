import {
  BaseResult,
  IGetMcpToolParams,
  IMCPCallToolResponse,
  IMcpCategoryMeta,
  IMcpMeta,
  IMcpService,
} from '@evo/types';

import { BaseBridge } from '../common/baseBridge';
import { Tool } from '@modelcontextprotocol/sdk/types.js';
import { ResultUtil } from '@evo/utils';
import { managerPkgService } from '../manager-pkg-service';

export class WebMcp extends BaseBridge implements IMcpService {
  getTools(params: IGetMcpToolParams): Promise<BaseResult<Tool[]>> {
    return managerPkgService.MCPService.MCPClientManager.getTools(params);
  }

  callTool(mcpId: string, name: string, args: any): Promise<BaseResult<IMCPCallToolResponse>> {
    return managerPkgService.MCPService.MCPClientManager.callTool(mcpId, name, args);
  }

  startClientByMcpId(mcpId: string): Promise<BaseResult<boolean>> {
    return managerPkgService.MCPService.MCPClientManager.startClientByMcpId(mcpId).then((res) => {
      if (res.success) {
        return ResultUtil.success(true);
      }
      return ResultUtil.error(res.error);
    });
  }

  startService(mcp: IMcpMeta): Promise<BaseResult<boolean>> {
    return managerPkgService.MCPService.MCPClientManager.startClient(mcp).then((res) => {
      if (res.success) {
        return ResultUtil.success(true);
      }
      return ResultUtil.error(res.error);
    });
  }

  stopService(mcpId: string): Promise<BaseResult<boolean>> {
    return managerPkgService.MCPService.MCPClientManager.stopClient(mcpId);
  }

  getServiceStatus(mcpId: string): Promise<BaseResult<boolean>> {
    return managerPkgService.MCPService.MCPClientManager.isClientRunning(mcpId);
  }

  createCategory(meta: Partial<IMcpCategoryMeta>): Promise<BaseResult<IMcpCategoryMeta>> {
    return managerPkgService.MCPService.MCPCategoryManager.create(meta as any);
  }

  updateCategory(meta: IMcpCategoryMeta): Promise<BaseResult<IMcpCategoryMeta>> {
    return managerPkgService.MCPService.MCPCategoryManager.update(meta);
  }

  deleteCategory(id: string): Promise<BaseResult<boolean>> {
    return managerPkgService.MCPService.MCPCategoryManager.delete(id);
  }

  getCategoryList(): Promise<BaseResult<IMcpCategoryMeta[]>> {
    return managerPkgService.MCPService.MCPCategoryManager.getList();
  }

  getCategoryById(id: string): Promise<BaseResult<IMcpCategoryMeta | null>> {
    return managerPkgService.MCPService.MCPCategoryManager.getById(id);
  }

  createMcp(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> {
    return managerPkgService.MCPService.MCPManager.create(meta);
  }

  updateMcp(meta: IMcpMeta): Promise<BaseResult<IMcpMeta>> {
    return managerPkgService.MCPService.MCPManager.update(meta);
  }

  deleteMcp(id: string): Promise<BaseResult<boolean>> {
    return managerPkgService.MCPService.MCPManager.delete(id);
  }

  getMcpList(): Promise<BaseResult<IMcpMeta[]>> {
    return managerPkgService.MCPService.MCPManager.getList();
  }

  getMcpById(id: string): Promise<BaseResult<IMcpMeta | null>> {
    return managerPkgService.MCPService.MCPManager.getById(id);
  }

  getMcpListByCategoryId(categoryId: string): Promise<BaseResult<IMcpMeta[]>> {
    return managerPkgService.MCPService.MCPManager.getListByCategoryId(categoryId);
  }
}
