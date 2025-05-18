export interface McpServiceOptions {
  dbManager: PGLiteManager;
  stdioClientConfigFunction?: IStdioClientConfigFunction;
  version?: string;
}
import { PGLiteManager } from '@evo/pglite-manager';
import { MCPManager } from './mcp-manager/MCPManager';
import { IDepManager, IStdioClientConfigFunction } from './types/common';
import { MCPCategoryManager } from './mcp-manager/MCPCategoryManager';
import { MCPClientManager } from './mcp-manager/MCPClientManager';

export class MCPService {
  private internalMCPManager: MCPManager;
  private internalMCPClientManager: MCPClientManager;
  private internalMCPCategoryManager: MCPCategoryManager;

  constructor(options: McpServiceOptions) {
    const depManager = {
      dbManager: options.dbManager,
    } as IDepManager;

    this.internalMCPManager = new MCPManager({
      depManager,
    });

    this.internalMCPClientManager = new MCPClientManager({
      depManager,
      stdioClientConfigFunction: options.stdioClientConfigFunction,
      version: options.version,
    });

    this.internalMCPCategoryManager = new MCPCategoryManager({
      depManager,
    });

    depManager.MCPManager = this.internalMCPManager;
    depManager.MCPCategoryManager = this.internalMCPCategoryManager;
    depManager.MCPClientManager = this.MCPClientManager;
  }

  get MCPManager() {
    return this.internalMCPManager;
  }

  get MCPCategoryManager() {
    return this.internalMCPCategoryManager;
  }

  get MCPClientManager() {
    return this.internalMCPClientManager;
  }
}
