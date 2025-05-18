import { MCPService } from '@evo/mcp-service';
import { SchemaManager } from '@evo/pglite-manager';

/**
 * 管理其它包的Server
 */
export class ManagerPkgService {
  private static instance: ManagerPkgService;
  private internalMCPService!: MCPService;

  private constructor() {
    this.initServices();
  }

  private initServices() {
    const schemaManager = SchemaManager.getInstance('idb://pg-data');
    const dbManager = schemaManager.getDbManager();

    this.internalMCPService = new MCPService({
      dbManager,
    });
  }

  static getInstance(): ManagerPkgService {
    if (!ManagerPkgService.instance) {
      ManagerPkgService.instance = new ManagerPkgService();
    }
    return ManagerPkgService.instance;
  }

  static async recreateInstance(): Promise<ManagerPkgService> {
    if (ManagerPkgService.instance) {
      ManagerPkgService.instance.initServices();
    }
    return ManagerPkgService.getInstance();
  }

  get MCPService() {
    return this.internalMCPService;
  }
}

export const managerPkgService = ManagerPkgService.getInstance();
