export interface McpServiceOptions {
  dbManager: PGLiteManager;
}
import { PGLiteManager } from '@evo/pglite-manager';
import { CliManager } from './cli-manager/CliManager';
import { MCPManager } from './mcp-manager/MCPManager';
import { IDepManager } from './types/common';

export class MCPService {
  private internalCliManager: CliManager;
  private internalMCPManager: MCPManager;

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
  }

  get cliManager() {
    return this.internalCliManager;
  }

  get MCPManager() {
    return this.internalMCPManager;
  }
}
