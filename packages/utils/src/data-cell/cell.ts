import {
  BehaviorSubject,
  Observable,
  Subject,
  filter,
  map,
  debounceTime as rxDebounceTime,
  merge as rxMerge,
  share,
  skip,
  take,
} from 'rxjs';
import {
  DataCellBaseSignalOption,
  DataCellInitOptions,
  DataCellListenOptions,
  DataCellListenResult,
  DataCellObservableResult,
  DataCellOptions,
  DataCellSetOptions,
  DataCellSetSignal,
  DataCellSignal,
  DataCellSignalEnum,
  DataCellSignalHandler,
} from './types';

import { BaseService } from '../base-service/service';
import { DATA_CELL_LAST_SIGNAL_SYMBOL } from './constants';
import { HookExecuteMode } from '../hook-executor/types';
import { isEqual } from 'lodash';

// 类型辅助定义
export type GetDataCellValue<T extends DataCell> = T extends DataCell<infer S> ? S : never;
export type GetDataCellContext<T extends DataCell> = T extends DataCell<infer D, infer C>
  ? C
  : never;
export type GetDataCellListenOptions<T extends DataCell> = DataCellListenOptions<
  GetDataCellValue<T>,
  GetDataCellContext<T>
>;
export type GetDataCellListenCallback<T extends DataCell> = DataCellSignalHandler<
  GetDataCellValue<T>,
  GetDataCellContext<T>
>;
export type GetDataCellListenNotice<T extends DataCell> = DataCellSignal<
  GetDataCellValue<T>,
  GetDataCellContext<T>
>;

export class DataCell<T = any, Context extends any = any> extends BaseService<
  DataCellOptions<T, Context>
> {
  // 核心状态
  protected data$: BehaviorSubject<T>;
  protected noticeTrigger$: BehaviorSubject<DataCellSignal<T, Context>>;
  protected commonObservable: Observable<DataCellSignal<T, Context>>;
  protected suspendAllSignal = false;

  constructor(initialData: T, options: DataCellInitOptions<T, Context> = {}) {
    // 确保同步初始化
    // @ts-ignore
    options.deferredInit = false;
    super(options);

    // 创建数据主题
    this.data$ = new BehaviorSubject<T>(initialData);

    // 创建信号主题
    this.noticeTrigger$ = new BehaviorSubject<DataCellSignal<T, Context>>({
      prev: undefined,
      next: initialData,
      context: this.context,
      action: DataCellSignalEnum.INIT,
      signalInfo: options.signalInfo,
    });

    // 创建共享的可观察对象
    this.commonObservable = this.createCommonObservable();

    // 订阅完成事件
    this.subscribeToCompletion();
  }

  private createCommonObservable(): Observable<DataCellSignal<T, Context>> {
    return this.noticeTrigger$.pipe(
      skip(1),
      map((notice) => {
        if (notice.action !== DataCellSignalEnum.DESTROY) {
          this.data$.next(notice.next);
        }
        return notice;
      }),
      share()
    );
  }

  private subscribeToCompletion() {
    this.commonObservable.subscribe({
      complete: () => {
        this.data$.complete();
      },
    });
  }

  // 公共接口
  get [DATA_CELL_LAST_SIGNAL_SYMBOL]() {
    return this.noticeTrigger$.getValue();
  }

  get(): T {
    return this.data$.getValue();
  }

  set(value: T, options?: DataCellSetOptions) {
    const prev = this.data$.getValue();
    let next = value;

    const beforeSetHooks = this.execute(
      'beforeSet',
      { prev, next, options, context: this.context },
      {
        mode: HookExecuteMode.REDUCE,
        lockData: true,
      }
    );

    this.handleHookContexts({
      contexts: beforeSetHooks,
      doAction: (contexts) => {
        next = contexts?.at(-1)?.data?.next ?? value;

        this.noticeTrigger$.next({
          prev,
          next,
          context: this.context,
          action: DataCellSignalEnum.SET,
          ...options,
        });
      },
    });
  }

  destroy(options?: DataCellBaseSignalOption) {
    const currentValue = this.get();

    this.noticeTrigger$.next({
      prev: currentValue,
      next: undefined,
      context: this.context,
      action: DataCellSignalEnum.DESTROY,
      signalInfo: options?.signalInfo,
    });

    this.noticeTrigger$.complete();

    super.destroy();
  }

  protected handleCleanup() {
    super.handleCleanup();
  }

  // RxJS 相关方法
  getRx(): BehaviorSubject<T> {
    const proxyIns = Object.create(this.data$);

    proxyIns.next = this.set.bind(this);
    proxyIns.complete = this.destroy.bind(this);

    return proxyIns;
  }

  // 监听相关方法
  wrapListenObservable<Options extends DataCellListenOptions<T, Context>>(listenOptions?: Options) {
    const options = this.normalizeListenOptions(listenOptions);
    const {
      receiveSilentSignal,
      receiveDestroySignal,
      ignoreSuspend,
      checkEqual,
      once,
      debounceTime,
      times,
      extraFilter,
    } = options;

    let maxExecuteTimes = times ? times : once ? 1 : Infinity;
    const checkEqualFn = checkEqual instanceof Function ? checkEqual : isEqual;

    // 创建可观察对象和控制器
    let suspendCurrentObservable = false;
    const manualTrigger = new Subject<DataCellSignal<T, Context>>();

    // 确保手动触发器在数据流完成时也完成
    this.commonObservable.subscribe({
      complete: () => manualTrigger.complete(),
    });

    // 构建过滤链
    let observable$ = this.buildFilterChain(
      debounceTime,
      receiveDestroySignal,
      ignoreSuspend,
      receiveSilentSignal,
      checkEqual,
      checkEqualFn,
      extraFilter,
      suspendCurrentObservable
    );

    // 合并手动触发和自动触发
    observable$ = rxMerge(manualTrigger, observable$).pipe(take(maxExecuteTimes));

    // 创建结果对象
    return this.createObservableResult(observable$, manualTrigger, suspendCurrentObservable);
  }

  private normalizeListenOptions<Options extends DataCellListenOptions<T, Context>>(
    listenOptions?: Options
  ) {
    return {
      receiveSilentSignal: false,
      receiveDestroySignal: false,
      ignoreSuspend: false,
      checkEqual: false,
      once: false,
      ...listenOptions,
    };
  }

  private buildFilterChain(
    debounceTime: number | undefined,
    receiveDestroySignal: boolean,
    ignoreSuspend: boolean,
    receiveSilentSignal: boolean,
    checkEqual: boolean | Function,
    checkEqualFn: Function,
    extraFilter: Function | undefined,
    suspendCurrentObservable: boolean
  ) {
    let observable$ = this.commonObservable;

    // 应用防抖
    if (debounceTime !== undefined) {
      observable$ = this.applyDebounce(observable$, debounceTime);
    }

    // 应用过滤器
    return observable$.pipe(
      filter((notice) =>
        notice.action === DataCellSignalEnum.DESTROY ? receiveDestroySignal : true
      ),
      filter(() => {
        if (ignoreSuspend) {
          return true;
        }
        return !(this.suspendAllSignal || suspendCurrentObservable);
      }),
      filter((notice) => {
        if (notice.silent) {
          return receiveSilentSignal;
        }
        return true;
      }),
      filter((notice) => {
        if (
          checkEqual &&
          notice.action === DataCellSignalEnum.SET &&
          checkEqualFn(notice.prev, notice.next)
        ) {
          return false;
        }
        return true;
      }),
      filter((notice) => extraFilter?.(notice) ?? true)
    );
  }

  private applyDebounce(observable$: Observable<DataCellSignal<T, Context>>, debounceTime: number) {
    let lastNotice = this[DATA_CELL_LAST_SIGNAL_SYMBOL];

    return observable$.pipe(
      rxDebounceTime(debounceTime),
      map((notice) => {
        if (notice.action === 'set') {
          const rebuildNotice: DataCellSetSignal = {
            ...notice,
            prev: lastNotice.next,
          };

          lastNotice = notice;
          return rebuildNotice;
        }
        return notice;
      })
    );
  }

  private createObservableResult(
    observable$: Observable<DataCellSignal<T, Context>>,
    manualTrigger: Subject<DataCellSignal<T, Context>>,
    suspendCurrentObservable: boolean
  ): DataCellObservableResult<T, Context> {
    const result: DataCellObservableResult<T, Context> = {
      get suspended() {
        return suspendCurrentObservable;
      },
      observable$,
      forceTrigger: () => manualTrigger.next(this.noticeTrigger$.getValue()),
      suspend: () => {
        suspendCurrentObservable = true;
      },
      restart: (immediateWhenRestart = false) => {
        if (suspendCurrentObservable === false) {
          return;
        }
        suspendCurrentObservable = false;
        if (immediateWhenRestart) {
          result.forceTrigger();
        }
      },
    };

    return result;
  }

  listen<
    Callback extends DataCellSignalHandler<T, Context>,
    Options extends DataCellListenOptions<T, Context>
  >(callback: Callback, listenOptions?: Options) {
    const { immediate, ...restOptions } = listenOptions ?? {};

    const observableResult = this.wrapListenObservable(restOptions);
    const { observable$: cellObservable$, forceTrigger, suspend, restart } = observableResult;

    const subscription = cellObservable$.subscribe(callback);

    immediate && forceTrigger();

    return {
      unsubscribe: () => subscription.unsubscribe(),
      suspend,
      restart,
      get suspended() {
        return observableResult.suspended;
      },
    };
  }

  // 全局暂停/恢复
  suspendListen() {
    this.suspendAllSignal = true;
  }

  restartListen() {
    this.suspendAllSignal = false;
  }
}
