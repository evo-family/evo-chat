import { PGLiteManager } from '@evo/pglite-manager';
import { MCPManager } from '../mcp-manager/MCPManager';
import { MCPCategoryManager } from '../mcp-manager/MCPCategoryManager';

export interface IDepManager {
  dbManager: PGLiteManager;
  MCPManager: MCPManager;
  MCPCategoryManager: MCPCategoryManager;
}
