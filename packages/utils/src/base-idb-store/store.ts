import Dexie, { IndexableType } from 'dexie';
import { asyncBufferThrottle, bufferDebounce, PromiseWrap } from '../utils/common';
import { bufferCount, bufferTime } from 'rxjs';

/**
 * IndexedDB 存储选项接口
 */
export interface IBaseIDBStoreOptions {
  /** 默认表名 */
  defaultTable: string;
  /** 数据库版本 */
  version: number;
  /** 表结构定义 */
  schema?: Record<string, string>;
}

/**
 * 存储项结构
 */
interface IStoreItem<D> {
  id: string;
  data: D;
}

/**
 * 基础 IndexedDB 存储类
 * 提供对 IndexedDB 的简单封装，支持基本的 CRUD 操作
 */
export class BaseIDBStore<T = any> {
  /** 数据库名称 */
  private readonly key: string;
  /** 存储选项 */
  private readonly options: IBaseIDBStoreOptions;
  /** Dexie 实例 */
  private db: Dexie;
  /** 数据库是否已初始化 */
  private initialized: boolean = false;
  /** 初始化错误次数 */
  private initErrorCount: number = 0;
  /** 最大初始化尝试次数 */
  private readonly MAX_INIT_ATTEMPTS: number = 3;

  /**
   * 构造函数
   * @param key 数据库名称
   * @param options 存储选项
   */
  constructor(key: string, options: IBaseIDBStoreOptions = { defaultTable: 'cache', version: 2 }) {
    this.key = key;
    this.options = {
      ...options,
      schema: options.schema || { [options.defaultTable]: '&id, data' },
    };
    this.db = this.initDB();
  }

  /**
   * 获取默认表名
   */
  get defaultTable(): string {
    return this.options.defaultTable;
  }

  /**
   * 获取数据库版本
   */
  get version(): number {
    return this.options.version;
  }

  /**
   * 初始化数据库
   * @returns Dexie 实例
   */
  private initDB(): Dexie {
    try {
      const dbIns = new Dexie(this.key);

      // 配置数据库版本和表结构
      dbIns.version(this.version).stores(
        this.options.schema || {
          [this.defaultTable]: '&id, data',
        }
      );

      // 预先打开表以验证连接
      dbIns.table(this.defaultTable);

      this.initialized = true;
      this.initErrorCount = 0;
      return dbIns;
    } catch (error) {
      console.error(`初始化数据库失败: ${this.key}`, error);
      this.initErrorCount++;

      // 如果超过最大尝试次数，抛出错误
      if (this.initErrorCount > this.MAX_INIT_ATTEMPTS) {
        throw new Error(`无法初始化数据库 ${this.key}，已达到最大尝试次数`);
      }

      // 如果已有实例，尝试重用
      return this.db || new Dexie(this.key);
    }
  }

  /**
   * 确保数据库已初始化
   * @returns 是否初始化成功
   */
  private async ensureInitialized(): Promise<boolean> {
    if (this.initialized) return true;

    try {
      // 尝试重新初始化
      this.db = this.initDB();
      await this.db.open();
      this.initialized = true;
      return true;
    } catch (error) {
      console.error('确保数据库初始化失败', error);
      return false;
    }
  }

  /**
   * 错误预处理
   * 当发生错误时，关闭并删除数据库，然后重新初始化
   * @param e 错误对象
   */
  private async errorPreHandler(e: any): Promise<void> {
    console.warn('数据库操作错误', e);

    // 只有在严重错误时才重置数据库
    if (e?.name === 'InvalidStateError' || e?.message?.includes('schema') || !this.initialized) {
      try {
        const currentDB = this.db;
        this.initialized = false;

        // 安全关闭当前数据库
        if (currentDB && currentDB.isOpen()) {
          await currentDB.close();
        }

        // 删除并重新创建数据库
        if (currentDB) {
          await currentDB.delete();
        }

        // 重新初始化
        this.db = this.initDB();
        await this.db.open();
        this.initialized = true;
      } catch (resetError) {
        console.error('重置数据库失败', resetError);
      }
    }
  }

  /**
   * 获取表对象
   * @param tableName 表名，默认为默认表
   * @returns 表对象
   */
  public getTable<D extends T>(tableName = this.defaultTable) {
    return this.db.table<IStoreItem<D>>(tableName);
  }

  /**
   * 分发操作到指定表
   * @param tableName 表名
   * @param handler 处理函数
   * @returns 处理结果
   */
  protected async dispatch<D extends T = T, R = any>(
    tableName: string,
    handler: (table: Dexie.Table<IStoreItem<D>, IndexableType, IStoreItem<D>>) => Promise<R> | R
  ): Promise<R | undefined> {
    // 确保数据库已初始化
    if (!(await this.ensureInitialized())) {
      return undefined;
    }

    try {
      const storeTable = this.getTable<D>(tableName);
      return await handler(storeTable);
    } catch (e) {
      await this.errorPreHandler(e);
      return undefined;
    }
  }

  // ==================== 公共数据操作方法 ====================

  /**
   * 获取数据
   * @param key 键
   * @param tableName 表名，默认为默认表
   * @returns 数据
   */
  public async get<D extends T>(
    key: string,
    tableName = this.defaultTable
  ): Promise<D | undefined> {
    if (!key) return undefined;

    return this.dispatch<D>(tableName, async (storeTable) => {
      const data = await storeTable.get(key);
      return data?.data;
    });
  }

  /**
   * 单个入参形式，但批量机制去获取数据
   * @param key 键
   * @param tableName 表名，默认为默认表
   * @returns 数据
   */
  public bufferedGet = asyncBufferThrottle<[key: string, tableName?: string], T | undefined>(
    (bufferedParams) => {
      const grouped: Record<string, [{ key: string; task: PromiseWrap<any> }]> = {};
      const proxyGrouped = new Proxy(grouped, {
        get: (target, tableName) => {
          let value = Reflect.get(target, tableName);

          if (!value) {
            value = [];
            Reflect.set(target, tableName, value);
          }

          return value;
        },
      });

      bufferedParams.forEach((bufferedItem) => {
        const { params, task } = bufferedItem;
        const [key, tableName = this.defaultTable] = params;

        if (!key) return task.resolve(undefined);

        proxyGrouped[tableName].push({ key, task });
      });

      Object.entries(grouped).forEach(([tableName, getParams]) => {
        this.dispatch(tableName, async (storeTable) => {
          const bulkKeys = getParams.map((item) => item.key);

          const data = await storeTable.bulkGet(bulkKeys);

          data.forEach((item, index) => getParams[index]?.task.resolve(item?.data));
        });
      });
    },
    50
  );

  /**
   * 设置数据
   * @param key 键
   * @param value 值
   * @param tableName 表名，默认为默认表
   * @returns 操作结果
   */
  public async set<D extends T>(key: string, value: D, tableName = this.defaultTable) {
    if (!key) return undefined;

    return this.dispatch<D>(tableName, (storeTable) => {
      return storeTable.put(
        {
          id: key,
          data: value,
        },
        key
      );
    });
  }

  /**
   * 单个入参形式，但批量机制去设置数据
   * @param key 键
   * @param tableName 表名，默认为默认表
   * @returns 数据
   */
  public bufferedSet = asyncBufferThrottle<
    [key: string, value: T, tableName?: string],
    T | undefined
  >((bufferedParams) => {
    const grouped: Record<string, [{ id: string; data: T }]> = {};
    const proxyGrouped = new Proxy(grouped, {
      get: (target, tableName) => {
        let value = Reflect.get(target, tableName);

        if (!value) {
          value = [];
          Reflect.set(target, tableName, value);
        }

        return value;
      },
    });

    bufferedParams.forEach((bufferedItem) => {
      const { params, task } = bufferedItem;
      const [key, value, tableName = this.defaultTable] = params;

      if (!key) return task.resolve(undefined);

      proxyGrouped[tableName].push({ id: key, data: value });
    });

    const asyncTasks = Object.entries(grouped).map(([tableName, getParams]) =>
      this.dispatch(tableName, async (storeTable) => storeTable.bulkPut(getParams))
    );

    Promise.allSettled(asyncTasks).then(() => {
      bufferedParams.forEach((item) => item.task.resolve(undefined));
    });
  }, 50);

  /**
   * 删除数据
   * @param key 键
   * @param tableName 表名，默认为默认表
   * @returns 操作结果
   */
  public async delete<D extends T>(key: string, tableName = this.defaultTable): Promise<void> {
    if (!key) return;

    return this.dispatch<D, void>(tableName, (storeTable) => {
      return storeTable.delete(key);
    });
  }

  /**
   * 清空表
   * @param tableName 表名，默认为默认表
   * @returns 操作结果
   */
  public async clear(tableName = this.defaultTable): Promise<void> {
    return this.dispatch(tableName, (storeTable) => {
      return storeTable.clear();
    });
  }

  /**
   * 获取所有数据
   * @param tableName 表名，默认为默认表
   * @returns 所有数据数组
   */
  public async getAll<D extends T>(tableName = this.defaultTable): Promise<D[]> {
    return (
      (await this.dispatch<D, D[]>(tableName, async (storeTable) => {
        const allData = await storeTable.toArray();
        return allData.map((item) => item.data);
      })) ?? []
    );
  }

  public async bulkGet<D extends T>(
    keys: Array<string>,
    tableName = this.defaultTable
  ): Promise<Array<D | undefined>> {
    if (!keys.length) return [];

    return this.dispatch<D>(tableName, async (storeTable) => {
      const result = await storeTable.bulkGet(keys);
      return result.map((item) => item?.data);
    });
  }

  /**
   * 批量设置数据
   * @param items 键值对数组
   * @param tableName 表名，默认为默认表
   * @returns 操作结果
   */
  public async bulkSet<D extends T>(
    items: Array<{ key: string; value: D }>,
    tableName = this.defaultTable
  ): Promise<void> {
    if (!items.length) return;

    return this.dispatch<D, void>(tableName, async (storeTable) => {
      const storeItems = items.map(({ key, value }) => ({
        id: key,
        data: value,
      }));

      await storeTable.bulkPut(storeItems);
    });
  }

  /**
   * 批量删除数据
   * @param keys 键数组
   * @param tableName 表名，默认为默认表
   * @returns 操作结果
   */
  public async bulkDelete(keys: string[], tableName = this.defaultTable): Promise<void> {
    if (!keys.length) return;

    return this.dispatch(tableName, (storeTable) => {
      return storeTable.bulkDelete(keys);
    });
  }

  /**
   * 关闭数据库连接
   */
  public async close(): Promise<void> {
    if (this.db && this.db.isOpen()) {
      this.db.close();
    }
  }
}
