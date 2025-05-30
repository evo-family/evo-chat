import { KnowledgeService } from '@evo/knowledge-service';
import { MCPService } from '@evo/mcp-service';
import { ResourceService } from './ResourceService';
import { SchemaManager } from '@evo/pglite-manager';
import { app } from 'electron';
import path from 'path';
import { getCommandPath } from '../utils/cliCheck';
import { getCommandArgs, getCommandEnv } from '../utils/mcpUtil';

/**
 * 管理其它包的Server
 */
export class ManagerService {
  private static instance: ManagerService;
  private internalKnowledgeService: KnowledgeService;
  private internalMCPService: MCPService;

  private constructor() {
    this.initServices();
  }

  private initServices() {
    const resourceService = ResourceService.getInstance();
    const pgDBPath = resourceService.pgDBPath;

    const schemaManager = SchemaManager.getInstance(pgDBPath);
    const dbManager = schemaManager.getDbManager();

    this.internalKnowledgeService = new KnowledgeService({
      dbManager,
      uploadDir: resourceService.uploadDir,
      vectorDBPath: resourceService.vectorDBPath,
    });

    this.internalMCPService = new MCPService({
      dbManager,
      stdioClientConfigFunction: {
        getCommandPath: getCommandPath,
        getCommandArgs: getCommandArgs,
        getCommandEnv: getCommandEnv,
      },
    });
  }

  static getInstance(): ManagerService {
    if (!ManagerService.instance) {
      ManagerService.instance = new ManagerService();
    }
    return ManagerService.instance;
  }

  static async recreateInstance(): Promise<ManagerService> {
    if (ManagerService.instance) {
      ManagerService.instance.initServices();
    }
    return ManagerService.getInstance();
  }

  get knowledgeService() {
    return this.internalKnowledgeService;
  }

  get MCPService() {
    return this.internalMCPService;
  }
}

export const managerService = ManagerService.getInstance();
