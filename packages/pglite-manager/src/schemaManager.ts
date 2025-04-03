import { PGliteOptions } from '@electric-sql/pglite';
import { PGLiteManager } from './pgLiteManager';
import { tableDefinitions } from './tableDefinitions';

/**
 * 数据库表结构管理器
 * 负责创建和管理所有表结构
 */
export class SchemaManager {
  private static initializedDbs = new Set<string>();
  private static instances: Map<string, SchemaManager> = new Map();

  private dbManager: PGLiteManager;
  private dbPath: string;

  private constructor(dbPath: string, options?: PGliteOptions) {
    this.dbPath = dbPath;
    this.dbManager = new PGLiteManager(dbPath, options);
    // 初始化所有表
    this.initAllTables();
  }

  /**
   * 获取 SchemaManager 实例
   * 单例模式，确保每个数据库路径只有一个实例
   */
  public static getInstance(dbPath: string, options?: PGliteOptions): SchemaManager {
    if (!this.instances.has(dbPath)) {
      this.instances.set(dbPath, new SchemaManager(dbPath, options));
    }
    return this.instances.get(dbPath)!;
  }

  /**
   * 获取数据库管理器实例
   */
  public getDbManager(): PGLiteManager {
    return this.dbManager;
  }

  /**
   * 检查表是否存在
   */
  private async isTableExists(tableName: string): Promise<boolean> {
    try {
      const result = await this.dbManager.query(`
        SELECT table_name
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = $1
      `, [tableName]);

      return result.rows.length > 0;
    } catch (error) {
      console.log(`检查表 ${tableName} 是否存在时出错:`, error);
      return false;
    }
  }

  /**
   * 初始化单个表
   */
  private async initTable(tableName: string): Promise<void> {
    if (SchemaManager.initializedDbs.has(`${this.dbPath}:${tableName}`)) {
      return;
    }

    if (await this.isTableExists(tableName)) {
      SchemaManager.initializedDbs.add(`${this.dbPath}:${tableName}`);
      return;
    }

    const tableDefinition = tableDefinitions[tableName];
    if (!tableDefinition) {
      throw new Error(`Table definition not found for: ${tableName}`);
    }

    await this.dbManager.createTable(tableName, tableDefinition.schema);
    SchemaManager.initializedDbs.add(`${this.dbPath}:${tableName}`);
  }

  /**
   * 初始化所有表结构
   */
  private async initAllTables(): Promise<void> {
    for (const tableName of Object.keys(tableDefinitions)) {
      await this.initTable(tableName);
    }
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    await this.dbManager.close();
    SchemaManager.instances.delete(this.dbPath);
  }
}
