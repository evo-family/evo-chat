import {
  ExecuteOptions,
  HookExecuteMode,
  HookExecuteOptions,
  HookExecutedResult,
  HookExecutorSysHooks,
  HookRecord,
  HookRunner,
  HookRunnerContext,
} from './types';

import { cloneDeep } from 'lodash';
import { isPromise } from '../utils/common';

// 常量配置
const DEFAULT_EXECUTE_OPTIONS: HookExecuteOptions = {
  mode: HookExecuteMode.FOREACH,
  async: false,
  lockData: false,
};

// 系统钩子名称
const SYS_HOOKS = {
  SNAPSHOT: 'snapshotHooks',
  AFTER_SNAPSHOT: 'afterSnapshotHooks',
  RESTORE: 'restoreHooks',
  AFTER_RESTORE: 'afterRestoreHooks',
};

export class HookExecutor<
  Hooks extends HookExecutorSysHooks,
  ExecuteKey extends keyof Hooks = keyof Hooks
> {
  // 存储注册的钩子
  protected hooksRecorder: Map<string | number | symbol, Array<HookRecord>> = new Map();
  protected snapshotHooksRecorder: Map<string | number | symbol, Array<HookRecord>> | undefined;

  constructor(options: Partial<Hooks> = {}) {
    this.initializeHooks(options);
  }

  // 初始化钩子
  private initializeHooks(options: Partial<Hooks>) {
    Object.entries(options).forEach(([key, value]: any) => {
      this.registerHook(key, value);
    });
  }

  // 快照相关方法
  snapshotHooks() {
    const deepCloneHooksRecorder = cloneDeep(this.hooksRecorder);

    this.execute(SYS_HOOKS.SNAPSHOT as any, deepCloneHooksRecorder, {
      lockData: false,
    });

    this.snapshotHooksRecorder = deepCloneHooksRecorder;

    this.execute(SYS_HOOKS.AFTER_SNAPSHOT as any, deepCloneHooksRecorder, {
      lockData: false,
    });
  }

  restoreHooks() {
    if (!this.snapshotHooksRecorder) return;

    this.execute(SYS_HOOKS.RESTORE as any, this.snapshotHooksRecorder, {
      lockData: false,
    });

    this.hooksRecorder = cloneDeep(this.snapshotHooksRecorder);

    this.execute(SYS_HOOKS.AFTER_RESTORE as any, this.snapshotHooksRecorder, {
      lockData: false,
    });
  }

  // 钩子注册管理
  registerHook<T extends ExecuteKey>(hookName: T, handler: Hooks[T], options?: ExecuteOptions) {
    if (!this.hooksRecorder.has(hookName)) {
      this.hooksRecorder.set(hookName, []);
    }

    const recordInfo = this.hooksRecorder.get(hookName);
    if (!recordInfo) return;

    // 创建钩子记录
    const hookInfo = this.createHookRecord(handler as any, options);

    // 确定插入位置
    const insertPosition = this.determineInsertPosition(recordInfo, hookInfo);

    // 插入钩子记录
    if (insertPosition !== -1) {
      recordInfo.splice(insertPosition, 0, hookInfo);
    } else {
      recordInfo.push(hookInfo);
    }

    return () => this.unregisterHook(hookName, handler);
  }

  private createHookRecord(handler: any, options?: ExecuteOptions): HookRecord {
    const hookInfo: HookRecord = {
      hookHandler: handler,
      ...options,
      executeCount: 0,
    };

    // 处理一次性钩子
    if (hookInfo.once && !Reflect.has(hookInfo, 'times')) {
      hookInfo.times = 1;
    }

    return hookInfo;
  }

  private determineInsertPosition(recordInfo: Array<HookRecord>, hookInfo: HookRecord): number {
    const setOrder = hookInfo.order ?? recordInfo.length - 1;

    return recordInfo.findIndex((callbackOptions, index) => {
      const currentOrder = callbackOptions.order ?? index;
      return currentOrder > setOrder;
    });
  }

  unregisterHook<T extends ExecuteKey>(hookName: T, handler?: Hooks[T]): boolean {
    const recordInfo = this.hooksRecorder.get(hookName);
    if (!recordInfo) return false;

    if (handler) {
      return this.removeSpecificHandler(recordInfo, hookName, handler);
    } else {
      // 清空所有处理函数
      recordInfo.length = 0;
      this.hooksRecorder.delete(hookName);
      return true;
    }
  }

  private removeSpecificHandler<T extends ExecuteKey>(
    recordInfo: Array<HookRecord>,
    hookName: T,
    handler: Hooks[T]
  ): boolean {
    const matchOptionIndex = recordInfo.findIndex((option) => {
      return option.hookHandler === handler;
    });

    if (matchOptionIndex !== -1) {
      if (recordInfo.length === 1) {
        recordInfo.length = 0;
        this.hooksRecorder.delete(hookName);
      } else {
        recordInfo.splice(matchOptionIndex, 1);
      }
      return true;
    }

    return false;
  }

  cleanHooks() {
    const allKeys = Array.from(this.hooksRecorder.keys());
    allKeys.forEach((key) => this.unregisterHook(key as any));
  }

  // 钩子执行核心逻辑
  private _doHookMethod<Callback extends (...args: any[]) => any>(
    params: HookRunner<HookExecutedResult<Callback>>
  ): HookExecutedResult<Callback> | Promise<HookExecutedResult<Callback>> {
    const { hookHandler, context, allowAsyncHook } = params;
    const callbackResult = hookHandler(context);

    // 处理异步钩子
    if (allowAsyncHook && isPromise(callbackResult)) {
      return callbackResult.then(() => context) as Promise<HookExecutedResult<Callback>>;
    }

    return context as HookExecutedResult<Callback>;
  }

  // 钩子执行器生成器
  private *hookExecutor<T extends ExecuteKey, Method extends Hooks[T]>(
    hookName: T,
    data?: any,
    options?: HookExecuteOptions
  ) {
    let recordInfo = this.hooksRecorder.get(hookName);
    if (!recordInfo) return [];

    // 创建副本避免执行过程中的修改
    recordInfo = recordInfo.slice(0);

    // 合并选项
    const mergedOptions = Object.assign({}, DEFAULT_EXECUTE_OPTIONS, options);

    // 准备执行环境
    const executionContext = this.prepareExecutionContext(hookName, data, mergedOptions);
    const { isReduceMode, allowAsyncHook } = executionContext;

    let needCleanHooks = new Set<HookRecord>();
    let results: HookRunnerContext<HookExecutedResult<Method>>[] = [];

    try {
      // 执行所有钩子
      for (let index = 0; index < recordInfo.length; index++) {
        const result = this.executeHook(
          recordInfo[index],
          hookName,
          executionContext,
          results,
          index,
          needCleanHooks,
          isReduceMode,
          allowAsyncHook
        );

        yield result;

        // 处理结果
        const hookContext = result;

        results.push(result);

        // 检查是否需要中断执行
        if (isReduceMode && hookContext.valid === false) {
          throw hookContext;
        }
      }
    } catch (error: any) {
      this.handleExecutionError(error);
    } finally {
      // 清理一次性钩子
      if (needCleanHooks.size) {
        this.cleanOneTimeHooks(hookName, recordInfo, needCleanHooks);
      }

      return results;
    }
  }

  private prepareExecutionContext<T extends ExecuteKey>(
    hookName: T,
    data: any,
    options: HookExecuteOptions
  ) {
    return {
      data: options.lockData ? data : Object.freeze(data),
      isReduceMode: options.mode === HookExecuteMode.REDUCE,
      allowAsyncHook: !!options.async,
      hookName,
    };
  }

  private executeHook<T extends ExecuteKey, Method extends Hooks[T]>(
    hookOption: HookRecord,
    hookName: T,
    executionContext: any,
    results: HookRunnerContext<HookExecutedResult<Method>>[],
    index: number,
    needCleanHooks: Set<HookRecord>,
    isReduceMode: boolean,
    allowAsyncHook: boolean
  ) {
    // 更新执行计数
    ++hookOption.executeCount;

    const { hookHandler, ...restHookOption } = hookOption;
    const lastContext = results.at(-1);

    // 创建钩子上下文
    const hookContext = Object.assign({}, executionContext.options, restHookOption, {
      valid: true,
      data: executionContext.data,
      hookName,
      index: Number(index),
    });

    // 处理 reduce 模式
    if (isReduceMode && lastContext !== undefined) {
      hookContext.data = lastContext.data;
    }

    // 执行钩子
    const triggerCallbackParams: HookRunner<HookExecutedResult<Method>> = {
      hookHandler,
      allowAsyncHook,
      isReduceMode,
      results,
      lastContext,
      context: hookContext,
    };

    const result = this._doHookMethod(triggerCallbackParams);

    // 检查是否需要清理
    if (hookOption.times && hookOption.executeCount >= hookOption.times) {
      needCleanHooks.add(hookOption);
    }

    return result;
  }

  private handleExecutionError(error: any) {
    if (error?.valid === false) {
      console.warn(`Hook execution interrupted: context validation failed.`, '\nContext:', error);
    } else {
      console.error(error);
    }
  }

  private cleanOneTimeHooks<T extends ExecuteKey>(
    hookName: T,
    recordInfo: Array<HookRecord>,
    needCleanHooks: Set<HookRecord>
  ) {
    const exceptOnceHooks = recordInfo.filter((hookOptions) => !needCleanHooks.has(hookOptions));
    this.hooksRecorder.set(hookName, exceptOnceHooks);
    needCleanHooks.clear();
  }

  // 公共执行接口
  execute<T extends ExecuteKey>(
    hookName: T,
    data?: any,
    options?: Omit<HookExecuteOptions, 'allowAsync'>
  ): HookExecutedResult<Hooks[T]>[] {
    return this.collectExecutionResults(
      this.hookExecutor(hookName, data, { ...options, async: false })
    );
  }

  async asyncExecute<T extends ExecuteKey>(
    hookName: T,
    data?: any,
    options?: Omit<HookExecuteOptions, 'allowAsync'>
  ): Promise<HookExecutedResult<Hooks[T]>[]> {
    const executor = this.hookExecutor(hookName, data, {
      ...options,
      async: true,
    });

    const results = this.collectAsyncExecutionResults(executor, options);

    return Promise.all(results);
  }

  private collectExecutionResults<T>(generator: Generator<T, T[], any>): T[] {
    const results: T[] = [];
    let current: IteratorResult<T, T[]>;

    while (!(current = generator.next()).done) {
      results.push(current.value);
    }

    return results;
  }

  private collectAsyncExecutionResults<T>(
    generator: Generator<T | Promise<T>, (T | Promise<T>)[], any>,
    options?: Omit<HookExecuteOptions, 'allowAsync'>
  ): (T | Promise<T>)[] {
    const results: (T | Promise<T>)[] = [];
    let current: IteratorResult<T | Promise<T>, (T | Promise<T>)[]>;

    while (!(current = generator.next()).done) {
      // 处理 reduce 模式下的异步值
      if (options?.mode === HookExecuteMode.REDUCE) {
        this.handleReduceModeAsyncValue(current.value);
      }

      results.push(current.value);
    }

    return results;
  }

  private async handleReduceModeAsyncValue<T>(value: T | Promise<T>) {
    if (isPromise(value)) {
      try {
        await value;
      } catch (error) {
        console.error(error);
      }
    }
  }
}
