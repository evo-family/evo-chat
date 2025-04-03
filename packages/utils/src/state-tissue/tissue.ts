import {
  BehaviorSubject,
  EMPTY,
  Observable,
  Subject,
  Subscription,
  delayWhen,
  filter,
  firstValueFrom,
  from,
  map,
  mergeMap,
  of,
  retry,
  debounceTime as rxDebounceTime,
  merge as rxMerge,
  share,
  skip,
  switchMap,
  take,
  tap,
} from 'rxjs';
import { GET_STATE_TISSUE_STORE_SYMBOL, STATE_TISSUE_RESTORE_FLAG } from './constants';
import {
  CellStoreInfo,
  TissueDataCellInitFailInfo,
  TissueDataModal,
  TissueGlobListenOptions,
  TissueInitOptions,
  TissueInitValueParam,
  TissueListenOptions,
  TissueListenResult,
  TissueModalKey,
  TissueModalKeyByParams,
  TissueModalValue,
  TissueObservableResult,
  TissueOptions,
  TissueSetOptions,
  TissueSignal,
  TissueSignalHandler,
} from './types';
import { clearTissueCache, getFormattedId, getTissueCache, pickKeysValueFromTissue } from './utils';
import { isEqual, isFunction, noop } from 'lodash';

import { BaseService } from '../base-service/service';
import { DATA_CELL_LAST_SIGNAL_SYMBOL } from '../data-cell/constants';
import { DataCell } from '../data-cell/cell';
import { HookExecuteMode } from '../hook-executor/types';
import { isPromise } from '../utils/common';

export class StateTissue<
  CurModalData extends TissueDataModal = TissueDataModal,
  Context = any,
  CellContext = any,
  CellKey extends TissueModalKey<CurModalData> = TissueModalKey<CurModalData>,
  CellValue extends TissueModalValue<CurModalData> = TissueModalValue<CurModalData>
> extends BaseService<TissueOptions<CurModalData, Context, CellContext>> {
  // 核心状态存储
  protected cellStore = new Map<CellKey, CellStoreInfo<CellValue, CellContext>>();
  protected initializing = new Set<CellKey>();
  protected waitingSubjects = new Map<CellKey, Subject<DataCell<CellValue, CellContext>>>();
  protected suspendListenFlag = false;

  // 全局信号流
  protected allCellsSubject = new BehaviorSubject<TissueSignal<CurModalData, Context, CellContext>>(
    {
      key: undefined,
      cellInfo: undefined,
      context: this.options.context,
    }
  );

  protected allCellsObservable$ = this.allCellsSubject.pipe(
    skip(1),
    map((notice) => {
      clearTissueCache(this);
      return notice;
    }),
    filter(() => !this.suspendListenFlag),
    share()
  );

  constructor(options: TissueInitOptions) {
    super({ ...options, deferredInit: false });
  }

  // 符号访问器
  get [GET_STATE_TISSUE_STORE_SYMBOL]() {
    return this.cellStore;
  }

  // 清理处理
  protected handleCleanup() {
    this.clearCells({ all: true });
    this.allCellsSubject.complete();
    super.handleCleanup();
  }

  // ==================== DataCell管理核心方法 ====================

  /**
   * 链接DataCell到组织
   */
  protected linkCell<ParamsKey extends CellKey>(
    key: ParamsKey,
    cell: DataCell<TissueModalKeyByParams<CurModalData, ParamsKey>, CellContext>,
    actionOptions?: TissueSetOptions
  ) {
    if (this.isCellExistOrInitializing(key)) {
      console.warn(`connect cell failed: key already exists.\n`, `duplicate key is: `, key);
      return;
    }

    // 创建监听器
    const listener = cell.wrapListenObservable({
      receiveSilentSignal: true,
      receiveDestroySignal: true,
      ignoreSuspend: true,
    });

    // 订阅DataCell变化
    const { observable$: cellObservable$ } = listener;
    const subscription = cellObservable$.subscribe({
      next: (notice) => {
        this.allCellsSubject.next({ key, cellInfo: notice, context: this.options.context });
      },
      complete: () => {
        this.clearCell(key);
      },
    });

    // 更新存储
    clearTissueCache(this);
    this.cellStore.set(key, { cell, subscription, listener });

    // 处理等待中的任务
    this.resolveWaitingTask(key, cell);

    // 发送初始信号
    this.allCellsSubject.next({
      key,
      cellInfo: { ...actionOptions, ...cell[DATA_CELL_LAST_SIGNAL_SYMBOL] },
      context: this.options.context,
    });
  }

  /**
   * 解决等待中的任务
   */
  private resolveWaitingTask<ParamsKey extends CellKey>(
    key: ParamsKey,
    cell: DataCell<any, CellContext>
  ) {
    const waitingTask = this.waitingSubjects.get(key);
    if (waitingTask) {
      waitingTask.next(cell);
      waitingTask.complete();
      this.waitingSubjects.delete(key);
    }
  }

  /**
   * 解除DataCell链接
   */
  protected unlinkCell<ParamsKey extends CellKey>(
    key: ParamsKey,
    error?: any,
    options?: {
      beforeUnsubscribe?: () => any;
    }
  ) {
    const { beforeUnsubscribe } = options ?? {};
    const cellInfo = this.cellStore.get(key);

    // 清理状态
    this.initializing.delete(key);
    this.cellStore.delete(key);
    clearTissueCache(this);

    // 处理等待中的任务
    this.handleWaitingTaskError(key, error);

    if (!cellInfo) {
      return;
    }

    // 执行解除前的回调
    beforeUnsubscribe && beforeUnsubscribe();
    cellInfo.subscription.unsubscribe();

    return cellInfo;
  }

  /**
   * 处理等待任务的错误
   */
  private handleWaitingTaskError<ParamsKey extends CellKey>(key: ParamsKey, error?: any) {
    const waitingTask = this.waitingSubjects.get(key);
    if (waitingTask) {
      waitingTask.error(
        error ??
          '[StateTissue] Initialization sequence interrupted: DataCell connection was terminated before initialization completed'
      );
      this.waitingSubjects.delete(key);
    }
  }

  /**
   * 生成新的DataCell
   */
  protected generateCell(key: CellKey, initialValue: CellValue, actionOptions?: TissueSetOptions) {
    const cell = new DataCell(initialValue, {
      ...this.options.cellOptions,
      ...actionOptions,
    });

    this.initializing.delete(key);
    this.linkCell(key, cell, actionOptions);

    return cell;
  }

  /**
   * 包装初始化失败处理器
   */
  protected wrapInitCellFailHandler(
    params: Pick<TissueDataCellInitFailInfo<CellKey>, 'key' | 'initialValue'>
  ) {
    return (error: any) => {
      const { key } = params;
      const errorContext: TissueDataCellInitFailInfo = Object.assign({ error }, params);

      this.unlinkCell(key, errorContext);
      this.execute('error', errorContext);
    };
  }

  /**
   * 初始化DataCell
   */
  protected initCell<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(
    key: ParamsKey,
    initialValue?: TissueInitValueParam<ParamsKeyValue>,
    actionOptions?: TissueSetOptions
  ) {
    const { initHandler } = this.options;

    // 检查初始化条件
    if (initHandler === undefined && initialValue === undefined) {
      return;
    }

    const validKey = getFormattedId(key);
    this.initializing.add(validKey);

    // 处理初始值
    const parsedInitialValue$ = this.createInitialValueObservable(initialValue, validKey);

    // 订阅初始化流
    parsedInitialValue$.subscribe({
      next: (validInitValue) => {
        // 防止异步初始化的过程中，该key被clear掉了
        if (this.initializing.has(validKey)) {
          this.generateCell(validKey, validInitValue as any, actionOptions);
        }
      },
      error: (error) => this.wrapInitCellFailHandler({ key: validKey, initialValue })(error),
      complete: () => {
        this.initializing.delete(validKey);
      },
    });
  }

  /**
   * 创建初始值可观察对象
   */
  private createInitialValueObservable<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(initialValue: TissueInitValueParam<ParamsKeyValue> | undefined, validKey: ParamsKey) {
    const { initHandler } = this.options;
    let parsedInitialValue$: Observable<ParamsKeyValue | undefined>;

    // 处理函数类型的初始值
    if (isFunction(initialValue)) {
      const fxnlInitValueResult = initialValue();
      parsedInitialValue$ = isPromise(fxnlInitValueResult)
        ? from(fxnlInitValueResult)
        : of(fxnlInitValueResult);
    } else {
      parsedInitialValue$ = of(initialValue);
    }

    // 应用自定义初始化处理器
    if (isFunction(initHandler)) {
      parsedInitialValue$ = parsedInitialValue$.pipe(
        switchMap((data) => {
          const manualInitResult = initHandler(validKey, data);
          return isPromise(manualInitResult) ? manualInitResult : of(manualInitResult);
        })
      );
    }

    return parsedInitialValue$;
  }

  // ==================== 公共DataCell管理接口 ====================

  /**
   * 检查DataCell是否存在
   */
  isCellExist<ParamsKey extends CellKey>(key: ParamsKey) {
    return this.cellStore.has(getFormattedId(key));
  }

  /**
   * 检查DataCell是否存在或正在初始化
   */
  isCellExistOrInitializing<ParamsKey extends CellKey>(key: ParamsKey) {
    const validKey = getFormattedId(key);
    return this.cellStore.has(validKey) || this.initializing.has(validKey);
  }

  /**
   * 尝试初始化DataCell
   */
  tryInitCell<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(
    key: ParamsKey,
    initialValue?: TissueInitValueParam<ParamsKeyValue>,
    actionOptions?: TissueSetOptions
  ) {
    if (this.destroyed) {
      return false;
    }

    if (this.isCellExistOrInitializing(key)) {
      return false;
    }

    this.initCell(key, initialValue, actionOptions);
    return true;
  }

  /**
   * 同步获取DataCell
   */
  getCellSync<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(key: ParamsKey, initialValue?: TissueInitValueParam<ParamsKeyValue>) {
    const validKey = getFormattedId(key);
    this.tryInitCell(validKey, initialValue);
    return this.cellStore.get(validKey)?.cell as undefined | DataCell<ParamsKeyValue, CellContext>;
  }

  /**
   * 同步获取DataCell值
   */
  getCellValueSync<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(key: ParamsKey, initialValue?: TissueInitValueParam<ParamsKeyValue>) {
    return this.getCellSync(key, initialValue)?.get() as ParamsKeyValue | undefined;
  }

  /**
   * 异步获取DataCell
   */
  async getCell<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(key: ParamsKey, initialValue?: TissueInitValueParam<ParamsKeyValue>) {
    this.tryInitCell(key, initialValue);
    return this.getCellUntil({ key, getObservable: false }) as unknown as Promise<
      DataCell<ParamsKeyValue, CellContext>
    >;
  }

  /**
   * 异步获取DataCell值
   */
  async getCellValue<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(key: ParamsKey, initialValue?: TissueInitValueParam<ParamsKeyValue>) {
    const cell = await this.getCell(key, initialValue);
    return cell.get() as ParamsKeyValue;
  }

  /**
   * 获取DataCell直到可用
   */
  getCellUntil<
    T extends boolean = false,
    ParamsKey extends CellKey = CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey> = TissueModalKeyByParams<
      CurModalData,
      ParamsKey
    >,
    ParamsKeyValueDataCell extends DataCell<ParamsKeyValue, CellContext> = DataCell<
      ParamsKeyValue,
      CellContext
    >
  >(params: {
    key: ParamsKey;
    getObservable?: T;
  }): T extends true ? Observable<ParamsKeyValueDataCell> : Promise<ParamsKeyValueDataCell>;
  getCellUntil<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>,
    ParamsKeyValueDataCell extends DataCell<ParamsKeyValue, CellContext> = DataCell<
      ParamsKeyValue,
      CellContext
    >
  >(params: { key: ParamsKey; getObservable?: boolean }) {
    const { key, getObservable = false } = params;

    // 检查销毁状态
    if (this.executingDestroy) {
      const errorPromise = Promise.reject(`invalid invoking: ${this.destroyedRemind}`);
      return getObservable ? from(errorPromise) : errorPromise;
    }

    const validKey = getFormattedId(key);

    // 检查DataCell是否已存在
    const cell = this.cellStore.get(validKey)?.cell as undefined | ParamsKeyValueDataCell;
    if (cell) {
      return getObservable ? of(cell) : Promise.resolve(cell);
    }

    // 处理等待中的主题
    return this.handleWaitingSubject(validKey, getObservable);
  }

  /**
   * 处理等待中的主题
   */
  private handleWaitingSubject<
    ParamsKey extends CellKey,
    ParamsKeyValueDataCell extends DataCell<any, CellContext>
  >(validKey: ParamsKey, getObservable: boolean) {
    const expectCellSubject = this.waitingSubjects.get(validKey);

    if (expectCellSubject) {
      return getObservable ? expectCellSubject : firstValueFrom(expectCellSubject);
    } else {
      const expectSubject = new Subject<ParamsKeyValueDataCell>();
      this.waitingSubjects.set(validKey, expectSubject as any);
      return getObservable ? expectSubject : firstValueFrom(expectSubject);
    }
  }

  /**
   * 获取DataCell值直到可用
   */
  getCellValueUntil<ParamsKey extends CellKey>(key: ParamsKey) {
    return this.getCellUntil({ key }).then((cell) => cell.get());
  }

  /**
   * 异步设置DataCell值
   */
  async setCellValue<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(key: ParamsKey, nextValue: ParamsKeyValue, actionOptions: TissueSetOptions = {}) {
    clearTissueCache(this);

    if (this.isCellExistOrInitializing(key)) {
      const cell = await this.getCellUntil({ key });
      cell.set(nextValue, actionOptions);
    } else {
      this.tryInitCell(key, () => nextValue, actionOptions);
    }
  }

  /**
   * 同步设置DataCell值
   */
  setCellValueSync<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(
    key: ParamsKey,
    nextValue: ParamsKeyValue,
    actionOptions: TissueSetOptions & {
      /**
       * @description 保证该set行为不丢失。如果该key正在初始化中（异步初始化），是否等待初始化结束后再进行set行为, 确保set的值不丢失且按顺序set。
       * @type {boolean}
       */
      promiseSet?: boolean;
    } = {}
  ) {
    const { promiseSet } = actionOptions;
    clearTissueCache(this);
    const validKey = getFormattedId(key);

    // 处理初始化中的情况
    if (this.initializing.has(validKey)) {
      if (promiseSet) {
        this.getCellUntil({ key })
          .then((cell) => {
            cell.set(nextValue, actionOptions);
          })
          .catch(console.error);
      } else {
        console.warn(
          `setCellValueSync failed: DataCell instance of key ${validKey} initialize not finish yet.`
        );
      }
      return;
    }

    // 设置值或初始化
    this.cellStore.get(validKey)?.cell.set(nextValue, actionOptions) ??
      this.tryInitCell(key, () => nextValue, actionOptions);
  }

  /**
   * 函数式设置DataCell值
   */
  fxnlSetCellValueSync<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(
    key: ParamsKey,
    handler: (prev: ParamsKeyValue | undefined) => ParamsKeyValue,
    actionOptions?: TissueSetOptions
  ) {
    const currentValue = this.isCellExist(key) ? this.getCellValueSync(key) : undefined;
    const handleResult = handler(currentValue);
    this.setCellValueSync(key, handleResult, actionOptions);
  }

  /**
   * 清除单个DataCell
   */
  clearCell<ParamsKey extends CellKey>(key: ParamsKey, actionOptions: TissueSetOptions = {}) {
    if (this.destroyed) {
      return;
    }

    const validKey = getFormattedId(key);
    const cell = this.cellStore.get(validKey)?.cell;
    const isInterruptInit = this.initializing.has(validKey);
    const isWaitingInit = this.waitingSubjects.has(validKey);

    // 检查是否需要清理
    if (cell === undefined && !isInterruptInit && !isWaitingInit) {
      return;
    }

    // 执行钩子
    const beforeClearCellHooks = this.execute(
      'beforeCellDestroy',
      {
        key: validKey,
        cell,
        isInterruptInit,
      },
      {
        mode: HookExecuteMode.FOREACH,
        lockData: false,
      }
    );

    // 处理钩子上下文
    this.handleHookContexts({
      contexts: beforeClearCellHooks,
      finallyAction: () => {
        if (cell) {
          if (actionOptions.silent === true) {
            cell.unregisterHook('destroy');
            cell.suspendListen();
          }
        }

        this.unlinkCell(validKey, undefined, {
          beforeUnsubscribe: () => cell?.destroy(actionOptions),
        });
      },
    });
  }

  /**
   * 清除多个DataCell
   */
  clearCells(
    params: {
      keys: Iterable<CellKey>;
    },
    actionOptions?: TissueSetOptions
  ): void;
  clearCells(
    params: {
      all: boolean;
    },
    actionOptions?: TissueSetOptions
  ): void;
  clearCells(
    params: {
      keys?: Iterable<CellKey>;
      all?: boolean;
    },
    actionOptions: TissueSetOptions = {}
  ) {
    if (this.destroyed) {
      return;
    }

    const { keys, all } = params;

    if (all) {
      // 清空所有DataCell
      for (const [key] of this.cellStore) {
        this.clearCell(key, actionOptions);
      }
      for (const key of this.initializing) {
        this.clearCell(key, actionOptions);
      }
    } else if (keys) {
      // 清空指定DataCell
      for (const key of keys) {
        this.clearCell(key, actionOptions);
      }
    }
  }

  /**
   * 获取多个DataCell的值
   */
  getCellsValue<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>,
    M extends boolean = true,
    A extends boolean = true,
    O extends boolean = false
  >(options: {
    keys: Iterable<ParamsKey>;
    all?: false;
    getMap?: M;
    getArray?: A;
    getObject?: O;
  }): (M extends true ? { map: Map<ParamsKey, ParamsKeyValue | undefined> } : {}) &
    (A extends true ? { array: (ParamsKeyValue | undefined)[] } : {}) &
    (O extends true ? { object: Record<ParamsKey, ParamsKeyValue | undefined> } : {});
  getCellsValue<
    ParamsKey extends CellKey,
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>,
    M extends boolean = true,
    A extends boolean = true,
    O extends boolean = false
  >(options: {
    all: true;
    getMap?: M;
    getArray?: A;
    getObject?: O;
  }): (M extends true ? { map: Map<CellKey, CellValue | undefined> } : {}) &
    (A extends true ? { array: (CellValue | undefined)[] } : {}) &
    (O extends true ? { object: Record<CellKey, CellValue | undefined> } : {});
  getCellsValue<ParamsKey extends CellKey = CellKey>(options: {
    keys?: Iterable<ParamsKey>;
    all?: boolean;
    getMap?: boolean;
    getArray?: boolean;
    getObject?: boolean;
  }) {
    const { keys, all, getMap = true, getArray = true, getObject = false } = options;
    const result = {};

    if (all) {
      // 获取所有DataCell的值
      const cacheRecord = getTissueCache(this);
      getMap && Reflect.set(result, 'map', cacheRecord.cache.map);
      getArray && Reflect.set(result, 'array', cacheRecord.cache.array);
      getObject && Reflect.set(result, 'object', cacheRecord.cache.object);
    } else if (keys) {
      // 获取指定DataCell的值
      const pickedResult = pickKeysValueFromTissue(keys, this, { getMap, getArray, getObject });
      getMap && Reflect.set(result, 'map', pickedResult.map);
      getArray && Reflect.set(result, 'array', pickedResult.array);
      getObject && Reflect.set(result, 'object', pickedResult.object);
    }

    return result;
  }

  // ==================== 监听相关方法 ====================

  /**
   * 包装监听DataCell的可观察对象
   */
  wrapListenCellsObservable<
    ParamsKeys extends CellKey[],
    ParamsKey extends ParamsKeys[number],
    ParamsKeyValue extends TissueModalKeyByParams<CurModalData, ParamsKey>
  >(listenOptions: TissueListenOptions<CurModalData, Context, CellContext, ParamsKey>) {
    const {
      keys,
      checkEqual,
      ignoreSuspend,
      receiveSilentSignal,
      receiveDestroySignal,
      debounceTime,
      extraFilter,
      times,
      once,
    } = listenOptions;

    // 初始化控制变量
    let suspendCurrentObservable = false;
    let latestCellForceTrigger: Function = noop;
    const maxExecuteTimes = times ? times : once ? 1 : Infinity;
    const manualTrigger = new Subject<
      TissueSignal<CurModalData, Context, CellContext, ParamsKey>
    >();

    // 确保手动触发器在数据流完成时也完成
    this.allCellsObservable$.subscribe({
      complete: () => manualTrigger.complete(),
    });

    // 构建监听流
    let observable$: Observable<TissueSignal> = rxMerge(
      from(keys).pipe(
        mergeMap((keyItem) => {
          const key = getFormattedId(keyItem);
          let initReady = false;

          return of(key).pipe(
            delayWhen((key) => {
              initReady = this.isCellExist(key);

              return initReady ? of(true) : this.getCellUntil({ key, getObservable: true });
            }),
            map((key) => ({
              key,
              cell: this.getCellSync(key) as unknown as DataCell<ParamsKeyValue>,
            })),
            switchMap((option) => {
              const { key, cell } = option;

              const { observable$, forceTrigger } = cell.wrapListenObservable({
                receiveSilentSignal,
                receiveDestroySignal,
                checkEqual,
                ignoreSuspend,
                debounceTime,
              });

              latestCellForceTrigger = forceTrigger;

              const cellObservable$ = rxMerge(
                observable$.pipe(
                  tap({
                    complete: () => {
                      // 如果是box实例销毁带来的complete，不用再进行retry（再次监听未来同名key的初始化）了
                      if (this.executingDestroy) {
                        return;
                      }

                      throw STATE_TISSUE_RESTORE_FLAG;
                    },
                  })
                ),
                initReady ? EMPTY : of(cell[DATA_CELL_LAST_SIGNAL_SYMBOL])
              ).pipe(
                map((notice) => ({
                  key,
                  cellInfo: notice,
                  context: this.options.context,
                }))
              );

              return cellObservable$;
            }),
            retry({
              delay: (error) => {
                if (error === STATE_TISSUE_RESTORE_FLAG) {
                  return of(true);
                }

                throw error;
              },
            })
          );
        })
      )
    );
    // 应用防抖
    if (debounceTime !== undefined) {
      observable$ = observable$.pipe(rxDebounceTime(debounceTime));
    }

    // 应用过滤器
    observable$ = observable$.pipe(
      // 处理暂停状态
      filter(() => {
        if (ignoreSuspend) {
          return true;
        }
        return !(this.suspendListenFlag || suspendCurrentObservable);
      }),
      // 处理静默信号
      filter((notice) => {
        const { silent } = notice?.cellInfo ?? {};
        if (notice && silent) {
          return !!receiveSilentSignal;
        }
        return true;
      }),
      // 处理销毁信号
      filter((notice) => {
        if (notice.cellInfo?.action === 'destroy') {
          return !!receiveDestroySignal;
        }
        return true;
      }),
      // 处理值相等检查
      filter((notice) => {
        if (checkEqual && notice?.cellInfo?.action === 'set') {
          const { prev, next } = notice.cellInfo;
          const checkEqualFn = checkEqual instanceof Function ? checkEqual : isEqual;
          return !checkEqualFn(prev, next);
        }
        return true;
      }),
      // 应用自定义过滤器
      filter((notice) => extraFilter?.(notice) ?? true)
    );

    // 合并手动触发和自动触发
    observable$ = rxMerge(observable$, manualTrigger).pipe(take(maxExecuteTimes));

    // 创建结果对象
    const result: TissueObservableResult<CurModalData, Context, CellContext, ParamsKey> = {
      get suspended() {
        return suspendCurrentObservable;
      },
      observable$,
      forceTrigger: () => {
        if (latestCellForceTrigger !== noop) {
          latestCellForceTrigger();
        } else {
          manualTrigger.next({
            key: undefined,
            cellInfo: undefined,
            context: this.options.context,
          });
        }
      },
      suspend: () => {
        suspendCurrentObservable = true;
      },
      restart: (immediateWhenRestart = false) => {
        if (suspendCurrentObservable === false) {
          return;
        }
        suspendCurrentObservable = false;
        immediateWhenRestart && result.forceTrigger();
      },
    };

    return result;
  }

  /**
   * 监听特定DataCell
   */
  listen<ParamsKeys extends CellKey[], ParamsKey extends ParamsKeys[number]>(
    callback: TissueSignalHandler<CurModalData, Context, CellContext, ParamsKey>,
    listenOptions: TissueListenOptions<CurModalData, Context, CellContext, ParamsKey>
  ) {
    const { immediate, ...restOptions } = listenOptions;

    // 获取观察结果
    const observableResult = this.wrapListenCellsObservable(restOptions);
    const { observable$: listenCells$, suspend, restart, forceTrigger } = observableResult;

    // 订阅观察对象
    const listenCellsSubscription = listenCells$.subscribe({
      next: callback,
      error: console.error,
    });

    // 处理立即触发
    immediate && forceTrigger();

    // 创建结果对象
    const result: TissueListenResult<CurModalData, Context, CellContext, ParamsKey> = {
      unsubscribe: () => listenCellsSubscription.unsubscribe(),
      suspend,
      restart,
      get suspended() {
        return observableResult.suspended;
      },
    };

    return result;
  }

  /**
   * 包装全局观察对象
   */
  wrapGlobObservable(
    listenOptions: Omit<TissueGlobListenOptions<CurModalData, Context, CellContext>, 'immediate'>
  ) {
    const {
      receiveSilentSignal = true,
      checkEqual = false,
      once = false,
      debounceTime,
      times,
      receiveDestroySignal = true,
      ignoreSuspend,
    } = listenOptions;

    // 初始化控制变量
    const checkEqualFn = checkEqual instanceof Function ? checkEqual : isEqual;
    let suspendCurrentObservable = false;
    const maxExecuteTimes = times ? times : once ? 1 : Infinity;
    const manualTrigger = new Subject<TissueSignal<CurModalData, Context, CellContext>>();

    // 确保手动触发器在数据流完成时也完成
    this.allCellsObservable$.subscribe({
      complete: () => manualTrigger.complete(),
    });

    // 构建过滤链
    let observable$: Observable<TissueSignal> = this.allCellsObservable$;

    // 应用防抖
    if (debounceTime !== undefined) {
      observable$ = observable$.pipe(rxDebounceTime(debounceTime));
    }

    // 应用过滤器
    observable$ = observable$.pipe(
      // 处理暂停状态
      filter(() => {
        if (ignoreSuspend) {
          return true;
        }
        return !(this.suspendListenFlag || suspendCurrentObservable);
      }),
      // 处理静默信号
      filter((notice) => {
        const { silent } = notice?.cellInfo ?? {};
        if (notice && silent) {
          return receiveSilentSignal;
        }
        return true;
      }),
      // 处理销毁信号
      filter((notice) => {
        if (notice.cellInfo?.action === 'destroy') {
          return receiveDestroySignal;
        }
        return true;
      }),
      // 处理值相等检查
      filter((notice) => {
        if (checkEqual && notice?.cellInfo?.action === 'set') {
          const { prev, next } = notice.cellInfo;
          return !checkEqualFn(prev, next);
        }
        return true;
      })
    );

    // 合并手动触发和自动触发
    observable$ = rxMerge(observable$, manualTrigger).pipe(take(maxExecuteTimes));

    const result: TissueObservableResult<CurModalData, Context, CellContext> = {
      get suspended() {
        return suspendCurrentObservable;
      },
      observable$,
      forceTrigger: () => manualTrigger.next(this.allCellsSubject.getValue()),
      suspend: () => {
        suspendCurrentObservable = true;
      },
      restart: (immediateWhenRestart = false) => {
        if (suspendCurrentObservable === false) {
          return;
        }
        suspendCurrentObservable = false;
        immediateWhenRestart && result.forceTrigger();
      },
    };

    return result;
  }

  /**
   * 全局监听
   */
  globListen(
    callback: TissueSignalHandler<CurModalData, Context, CellContext>,
    listenOptions: TissueGlobListenOptions<CurModalData, Context, CellContext>
  ) {
    const { immediate = false, ...restOptions } = listenOptions;

    // 获取观察结果
    const listenObservableResult = this.wrapGlobObservable(restOptions);
    const { observable$: globListen$, forceTrigger, suspend, restart } = listenObservableResult;

    // 订阅观察对象
    const globListenSubscription = globListen$.subscribe({
      next: callback,
      error: console.warn,
    });

    // 处理立即触发
    immediate && forceTrigger();

    // 创建结果对象
    const result: TissueListenResult<CurModalData, Context, CellContext> = {
      unsubscribe: () => globListenSubscription.unsubscribe(),
      suspend,
      restart,
      get suspended() {
        return listenObservableResult.suspended;
      },
    };

    return result;
  }

  /**
   * 暂停监听
   */
  suspendListen() {
    this.suspendListenFlag = true;
  }

  /**
   * 重启监听
   */
  restartListen() {
    this.suspendListenFlag = false;
  }

  /**
   * 连接DataCell
   */
  connectCell<ParamsKey extends CellKey>(
    key: ParamsKey,
    cell: DataCell<TissueModalKeyByParams<CurModalData, ParamsKey>, CellContext>
  ) {
    if (this.destroyed) {
      return;
    }

    this.linkCell(getFormattedId(key), cell as any);
  }

  /**
   * 断开DataCell连接
   */
  disconnectCell<ParamsKey extends CellKey>(key: ParamsKey) {
    if (this.destroyed) {
      return;
    }

    return this.unlinkCell(getFormattedId(key));
  }
}
