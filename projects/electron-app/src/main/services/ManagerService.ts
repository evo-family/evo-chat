import { KnowledgeService } from '@evo/knowledge-service';
import { SchemaManager } from '@evo/pglite-manager';
import { MCPService } from '@evo/mcp-service';
import { app } from 'electron';
import path from 'path';
import { logger } from '../logger';

// 知识库保存路径
logger.info('save-data-path:', path.join(app.getPath('userData'), 'knowledge-data'));

/**
 * 管理其它包的Server
 */
export class ManagerService {
  private internalKnowledgeService: KnowledgeService;

  private internalMCPService: MCPService;
  constructor() {
    const pgDBPath =
      path.join(app.getPath('userData'), 'knowledge-data', 'pg-db') ||
      path.join(process.cwd(), 'db.sqlite');

    const schemaManager = SchemaManager.getInstance(pgDBPath);
    const dbManager = schemaManager.getDbManager();
    // 初始化知识库服务
    this.internalKnowledgeService = new KnowledgeService({
      dbManager,
      uploadDir: path.join(app.getPath('userData'), 'knowledge-data', 'upload-files'),
      vectorDBPath: path.join(app.getPath('userData'), 'knowledge-data', 'vector-db'),
    });

    // 初始化MCP服务
    this.internalMCPService = new MCPService({
      dbManager,
    });
  }

  get knowledgeService() {
    return this.internalKnowledgeService;
  }

  get MCPService() {
    return this.internalMCPService;
  }
}

const managerService = new ManagerService();
export { managerService };
