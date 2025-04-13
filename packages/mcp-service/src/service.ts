export interface McpServiceOptions {
  dbManager: PGLiteManager;
  version?: string;
}
import { PGLiteManager } from '@evo/pglite-manager';
import { CliManager } from './cli-manager/CliManager';
import { MCPManager } from './mcp-manager/MCPManager';
import { IDepManager } from './types/common';
import { MCPCategoryManager } from './mcp-manager/MCPCategoryManager';
import { MCPClientManager } from './mcp-manager/MCPClientManager';

export class MCPService {
  private internalCliManager: CliManager;
  private internalMCPManager: MCPManager;
  private internalMCPClientManager: MCPClientManager;
  private internalMCPCategoryManager: MCPCategoryManager;

  constructor(options: McpServiceOptions) {
    const depManager = {
      dbManager: options.dbManager,
    } as IDepManager;

    this.internalCliManager = new CliManager({
      depManager,
    });
    this.internalMCPManager = new MCPManager({
      depManager,
    });

    this.internalMCPClientManager = new MCPClientManager({
      depManager,
      version: options.version,
    });

    this.internalMCPCategoryManager = new MCPCategoryManager({
      depManager,
    });

    depManager.MCPManager = this.internalMCPManager;
    depManager.MCPCategoryManager = this.internalMCPCategoryManager;
  }

  get cliManager() {
    return this.internalCliManager;
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
