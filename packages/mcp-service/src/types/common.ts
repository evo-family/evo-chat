import { PGLiteManager } from '@evo/pglite-manager';
import { MCPManager } from '../mcp-manager/MCPManager';
import { MCPCategoryManager } from '../mcp-manager/MCPCategoryManager';
import { MCPClientManager } from '../mcp-manager/MCPClientManager';
import { IMcpStdioConfig } from '@evo/types';

export interface IStdioClientConfigFunction {
  getCommandPath: (command: string) => Promise<string>;
  getCommandArgs: (config: IMcpStdioConfig) => string[];
  getCommandEnv: (config: IMcpStdioConfig) => Record<string, any>;
}
export interface IDepManager {
  dbManager: PGLiteManager;
  MCPManager: MCPManager;
  MCPCategoryManager: MCPCategoryManager;
  MCPClientManager: MCPClientManager;
}
