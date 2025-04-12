export interface McpServiceOptions {
  dbManager: PGLiteManager;
}
import { PGLiteManager } from '@evo/pglite-manager';
import { CliManager } from './cli-manager/CliManager';
import { MCPManager } from './mcp-manager/MCPManager';
import { IDepManager } from './types/common';
import { MCPCategoryManager } from './mcp-manager/MCPCategoryManager';

export class MCPService {
  private internalCliManager: CliManager;
  private internalMCPManager: MCPManager;
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

    this.internalMCPCategoryManager = new MCPCategoryManager({
      depManager,
    });
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
}
