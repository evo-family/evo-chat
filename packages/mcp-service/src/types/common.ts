import { PGLiteManager } from '@evo/pglite-manager';
import { MCPManager } from '../mcp-manager/MCPManager';
import { MCPCategoryManager } from '../mcp-manager/MCPCategoryManager';
import { MCPClientManager } from '../mcp-manager/MCPClientManager';

export interface IDepManager {
  dbManager: PGLiteManager;
  MCPManager: MCPManager;
  MCPCategoryManager: MCPCategoryManager;
  MCPClientManager: MCPClientManager;
}
