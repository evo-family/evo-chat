import {
  BaseServiceHooks,
  BaseServiceInitOptions,
  BaseServiceOptions,
} from '../base-service/types';

import { HookRunnerContext } from '../hook-executor/types';
import { Observable } from 'rxjs';

export interface DataCellBaseSignalOption {
  signalInfo?: any;
}

export enum DataCellSignalEnum {
  'INIT' = 'init',
  'SET' = 'set',
  'DESTROY' = 'destroy',
}

export interface DataCellCommonSignal<CONTEXT = any> extends DataCellBaseSignalOption {
  context: CONTEXT;
  silent?: boolean;
}

export interface DataCellInitSignal<T = any, CONTEXT = any> extends DataCellCommonSignal<CONTEXT> {
  prev: undefined;
  next: T;
  action: DataCellSignalEnum.INIT | 'init';
}

export interface DataCellSetSignal<T = any, CONTEXT = any> extends DataCellCommonSignal<CONTEXT> {
  prev: T;
  next: T;
  action: DataCellSignalEnum.SET | 'set';
}

export interface DataCellDestroySignal<T = any, CONTEXT = any>
  extends DataCellCommonSignal<CONTEXT> {
  prev: T;
  next: undefined;
  action: DataCellSignalEnum.DESTROY | 'destroy';
}

export type DataCellSignal<T = any, CONTEXT = any> =
  | DataCellInitSignal<T, CONTEXT>
  | DataCellSetSignal<T, CONTEXT>
  | DataCellDestroySignal<T, CONTEXT>;

export interface DataCellListenBaseOptions<T = any, CONTEXT = any> {
  /**
   * @description 强制接收 silent set行为的notice
   */
  receiveSilentSignal?: boolean;
  /**
   * @description 强制接收destroy那一次的notice（默认不接收）
   */
  receiveDestroySignal?: boolean;
  /**
   * @description 忽略接收该实例被调用suspendAllListen 或 单独的observableResult被调用suspend方法后的notice。（默认true）
   */
  ignoreSuspend?: boolean;
  /**
   * @description 只会在action === 'set'的时候触发。
   *              默认内置使用的lodash.isEqual如果数据结构过于复杂或对象值为互相引用的数据，会有很严重的性能问题，谨慎使用。
   *              当然，也可以传入function自己实现比较的逻辑。
   */
  checkEqual?: boolean | ((prev?: T, next?: T) => boolean);
  /**
   * @description 自定义实现filter的逻辑。返回true代表需要触发listen回调，返回false忽略该次notice。
   */
  extraFilter?: (notice: DataCellSignal<T, CONTEXT>) => boolean;
  /**
   * @description 只触发一次listen
   */
  once?: boolean;
  /**
   * @description 该listen能触发几次（callback被调用才算一次）
   */
  times?: number;
  /**
   * @description 防抖多少秒后才接收notice。它会影响notice.prev的值: 上次回调触发时的notice.next 会作为下次回调触发时的 notice.prev 的值，而不是根据set顺序的prev和next。
   */
  debounceTime?: number;
}

export interface DataCellSignalHandler<T = any, CONTEXT = any> {
  (signal: DataCellSignal<T, CONTEXT>): any;
}

export interface DataCellListenOptions<T = any, CONTEXT = any>
  extends DataCellListenBaseOptions<T, CONTEXT> {
  /**
   * @description immediate无法被debounceTime所限制，是强制立即触发的，无视所有ignore、suspend、silent等规则。
   */
  immediate?: boolean;
}

export interface DataCellSetOptions extends DataCellBaseSignalOption {
  silent?: boolean;
}

export interface DataCellHooks<T = any, Context extends any = any> extends BaseServiceHooks {
  beforeSet: (
    context: HookRunnerContext<{
      prev: T;
      next: T;
      options?: DataCellSetOptions;
      context: Context;
    }>
  ) => void;
}

export interface DataCellSelfOptions {}

export interface DataCellOptions<T = any, Context extends any = any>
  extends BaseServiceOptions<DataCellHooks<T, Context>, Context>,
    DataCellSelfOptions {}

export interface DataCellInitOptions<T = any, Context extends any = any>
  extends Omit<BaseServiceInitOptions<DataCellHooks<T, Context>, Context>, 'deferredInit'>,
    Partial<DataCellSelfOptions>,
    DataCellBaseSignalOption {}

export interface DataCellObservableResult<T = any, Context extends any = any> {
  /* 当前的listen是否处于暂停的状态 */
  suspended: boolean;
  /* listen的rx observable对象 */
  observable$: Observable<DataCellSignal<T, Context>>;
  /* 强制以最后一次的notice触发一次listen的回调 */
  forceTrigger: () => void;
  /* 暂停该listen的callback回调触发 */
  suspend: () => void;
  /* 重启当前listen的callback回调触发 */
  restart: (immediateWhenRestart?: boolean) => void;
}

export interface DataCellListenResult<T = any, Context extends any = any>
  extends Pick<DataCellObservableResult<T, Context>, 'suspend' | 'restart' | 'suspended'> {
  unsubscribe: () => void;
}
