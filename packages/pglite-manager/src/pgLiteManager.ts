import { PGlite, PGliteOptions } from '@electric-sql/pglite';
import {
  transformKeysToSnakeCase,
  transformObjectToCamelCase,
  transformResultToCamelCase,
} from './dbUtil';

/**
 * PgLite 数据库管理器
 * 提供通用的数据库操作能力
 */
export class PGLiteManager {
  private db: PGlite;
  private initialized: boolean = false;
  private dbPath: string;

  constructor(dbPath: string, options?: PGliteOptions) {
    this.dbPath = dbPath;
    this.db = new PGlite(this.dbPath, options);
  }

  /**
   * 初始化数据库连接
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;
    // await this.db.connect();
    this.initialized = true;
  }

  /**
   * 执行SQL查询
   * @param query SQL查询语句
   * @param params 查询参数
   * @returns 查询结果
   */
  async query(query: string, params: any[] = []): Promise<any> {
    if (!this.initialized) await this.initialize();
    transformResultToCamelCase;
    const result = await this.db.query(query, params);
    if (result.rows) {
      result.rows = transformResultToCamelCase(result.rows);
    }
    return result;
  }

  /**
   * 执行事务
   * @param callback 事务回调函数
   * @returns 事务执行结果
   */
  async transaction<T>(callback: (tx: any) => Promise<T>): Promise<T> {
    if (!this.initialized) await this.initialize();
    return await this.db.transaction(callback);
  }

  /**
   * 创建表
   * @param tableName 表名
   * @param schema 表结构定义
   */
  async createTable(tableName: string, schema: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    await this.db.query(`
      CREATE TABLE IF NOT EXISTS ${tableName} (
        ${schema}
      );
    `);
  }

  /**
   * 插入数据
   * @param tableName 表名
   * @param data 要插入的数据对象
   * @returns 插入的数据
   */
  async insert<T>(tableName: string, data: Record<string, any>): Promise<T> {
    if (!this.initialized) await this.initialize();

    const snakeCaseData = transformKeysToSnakeCase(data);
    const keys = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);
    const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

    const query = `
      INSERT INTO ${tableName} (${keys.join(', ')})
      VALUES (${placeholders})
      RETURNING *
    `;

    const result = await this.db.query(query, values);
    return transformObjectToCamelCase(result.rows[0]!) as T;
  }

  /**
   * 批量插入数据
   * @param tableName 表名
   * @param dataArray 要插入的数据对象数组
   * @returns 插入的行数
   */
  async batchInsert(tableName: string, dataArray: Record<string, any>[]): Promise<number> {
    if (dataArray.length === 0) return 0;
    if (!this.initialized) await this.initialize();

    let insertedCount = 0;

    await this.transaction(async (tx) => {
      for (const data of dataArray) {
        const snakeCaseData = transformKeysToSnakeCase(data);
        const keys = Object.keys(snakeCaseData);
        const values = Object.values(snakeCaseData);
        const placeholders = keys.map((_, i) => `$${i + 1}`).join(', ');

        const query = `
          INSERT INTO ${tableName} (${keys.join(', ')})
          VALUES (${placeholders})
        `;

        const result = await tx.query(query, values);
        insertedCount += result.rowCount;
      }
    });

    return insertedCount;
  }

  /**
   * 更新数据
   * @param tableName 表名
   * @param data 要更新的数据
   * @param conditions 更新条件
   * @returns 更新的行数
   */
  async update(
    tableName: string,
    data: Record<string, any>,
    conditions: Record<string, any>
  ): Promise<number> {
    if (!this.initialized) await this.initialize();

    const snakeCaseData = transformKeysToSnakeCase(data);
    const dataKeys = Object.keys(snakeCaseData);
    const dataValues = Object.values(snakeCaseData);

    const snakeCaseConditions = transformKeysToSnakeCase(conditions);
    const conditionKeys = Object.keys(snakeCaseConditions);
    const conditionValues = Object.values(snakeCaseConditions);

    const setClause = dataKeys.map((key, i) => `${key} = $${i + 1}`).join(', ');
    const whereClause = conditionKeys
      .map((key, i) => `${key} = $${i + dataKeys.length + 1}`)
      .join(' AND ');

    const query = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE ${whereClause}
      RETURNING *
    `;

    const result = await this.db.query(query, [...dataValues, ...conditionValues]);
    return result.affectedRows || 0;
  }

  /**
   * 根据ID更新数据
   * @param tableName 表名
   * @param id ID值
   * @param data 要更新的数据
   * @param idField ID字段名，默认为'id'
   * @returns 更新后的数据
   */
  async updateById<T>(
    tableName: string,
    id: string | number,
    data: Record<string, any>,
    idField: string = 'id'
  ): Promise<T | null> {
    if (!this.initialized) await this.initialize();

    const snakeCaseData = transformKeysToSnakeCase(data);
    const keys = Object.keys(snakeCaseData);
    const values = Object.values(snakeCaseData);

    const setClause = keys.map((key, i) => `${key} = $${i + 1}`).join(', ');

    const query = `
      UPDATE ${tableName}
      SET ${setClause}
      WHERE ${idField} = $${keys.length + 1}
      RETURNING *
    `;

    const result = await this.db.query(query, [...values, id]);
    return result.rows.length > 0 ? (transformObjectToCamelCase(result.rows[0]!) as T) : null;
  }

  async find<T>(
    tableName: string,
    conditions: Record<string, any> = {},
    options: {
      limit?: number;
      offset?: number;
      orderBy?: string;
      orderDirection?: 'ASC' | 'DESC';
      fields?: string[];
    } = {}
  ): Promise<T[]> {
    if (!this.initialized) await this.initialize();

    const snakeCaseConditions = transformKeysToSnakeCase(conditions);
    const keys = Object.keys(snakeCaseConditions);
    const values = Object.values(snakeCaseConditions);

    const fields = options.fields ? options.fields.join(', ') : '*';

    let query = `SELECT ${fields} FROM ${tableName}`;

    if (keys.length > 0) {
      const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    if (options.orderBy) {
      query += ` ORDER BY ${options.orderBy} ${options.orderDirection || 'ASC'}`;
    }

    if (options.limit) {
      query += ` LIMIT ${options.limit}`;
    }

    if (options.offset) {
      query += ` OFFSET ${options.offset}`;
    }

    const result = await this.db.query(query, values);
    return transformResultToCamelCase(result.rows) as T[];
  }

  /**
   * 根据ID查询单条数据
   * @param tableName 表名
   * @param id ID值
   * @param idField ID字段名，默认为'id'
   * @returns 查询结果
   */
  async findById<T>(
    tableName: string,
    id: string | number,
    idField: string = 'id'
  ): Promise<T | null> {
    if (!this.initialized) await this.initialize();

    const query = `SELECT * FROM ${tableName} WHERE ${idField} = $1 LIMIT 1`;
    const result = await this.db.query(query, [id]);

    return result.rows.length > 0 ? (transformObjectToCamelCase(result.rows[0]!) as T) : null;
  }

  /**
   * 删除数据
   * @param tableName 表名
   * @param conditions 删除条件
   * @returns 删除的行数
   */
  async delete(tableName: string, conditions: Record<string, any>): Promise<number> {
    if (!this.initialized) await this.initialize();

    const keys = Object.keys(conditions);
    const values = Object.values(conditions);

    let query = `DELETE FROM ${tableName}`;

    if (keys.length > 0) {
      const whereClause = keys.map((key, i) => `${key} = $${i + 1}`).join(' AND ');
      query += ` WHERE ${whereClause}`;
    }

    const result = await this.db.query(query, values);
    return result.affectedRows!;
  }

  /**
   * 根据ID删除数据
   * @param tableName 表名
   * @param id ID值
   * @param idField ID字段名，默认为'id'
   * @returns 是否删除成功
   */
  async deleteById(
    tableName: string,
    id: string | number,
    idField: string = 'id'
  ): Promise<boolean> {
    if (!this.initialized) await this.initialize();

    const query = `DELETE FROM ${tableName} WHERE ${idField} = $1`;
    const result = await this.db.query(query, [id]);

    return result.affectedRows! > 0;
  }

  /**
   * 清空表
   * @param tableName 表名
   * @returns 删除的行数
   */
  async truncate(tableName: string): Promise<void> {
    if (!this.initialized) await this.initialize();
    await this.db.query(`TRUNCATE TABLE ${tableName}`);
  }

  /**
   * 关闭数据库连接
   */
  async close(): Promise<void> {
    if (!this.initialized) return;
    
    try {
      // 先将状态设置为未初始化，防止重复调用
      this.initialized = false;
      // 确保数据库实例存在
      if (this.db) {
        await this.db.query('SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE pid <> pg_backend_pid()');
        await this.db.close();
      }
    } catch (error) {
      console.error('关闭数据库连接失败:', error);
      // 即使出错也保持未初始化状态
      this.initialized = false;
    }
  }

  /**
   * 获取原始数据库实例
   * @returns PgLite实例
   */
  getDb(): PGlite {
    return this.db;
  }
}
