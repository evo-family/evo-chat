import {
  BaseServiceHooks,
  BaseServiceInitOptions,
  BaseServiceOptions,
} from '../base-service/types';
import {
  DataCellInitOptions,
  DataCellListenBaseOptions,
  DataCellSetOptions,
  DataCellSignal,
} from '../data-cell/types';

import { DataCell } from '../data-cell/cell';
import { HookRunnerContext } from '../hook-executor/types';
import { Observable, Subscription } from 'rxjs';
import { StateTissue } from './tissue';

export type MapKey<T> = T extends Map<infer K, any> ? K : any;
export type MapValue<T> = T extends Map<any, infer V> ? V : any;
export type RecordKey<T> = T extends Record<infer K, any> ? K : any;
export type RecordValue<T> = T extends Record<infer K, infer V> ? V : any;

export type TissueDataModal = Record<any, any> | Map<any, any>;

export type TissueModalKey<Modal extends TissueDataModal> = Modal extends Map<any, any>
  ? MapKey<Modal>
  : keyof Modal;

export type TissueModalValue<Modal extends TissueDataModal> = Modal extends Map<any, any>
  ? MapValue<Modal>
  : RecordValue<Modal>;

export type TissueModalKeyByParams<
  Modal extends TissueDataModal,
  K extends TissueModalKey<Modal>
> = Modal extends Map<any, any> ? MapValue<Modal> : Modal[K];

export type TissueKey = TissueModalKey<Record<any, any> | Map<any, any>>;

export type TissueValue = TissueModalValue<Record<any, any> | Map<any, any>>;

export enum TissueSignalTypesEnum {
  'INIT' = 'INIT',
  'SET' = 'SET',
  'DESTROY' = 'DESTROY',
}

export interface TissueSetOptions extends DataCellSetOptions {}

export interface TissueBaseSignal<
  Modal extends TissueDataModal = TissueDataModal,
  Context = any,
  TissueContext = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>
> {
  key: NamedKey;
  cellInfo: DataCellSignal<TissueModalKeyByParams<Modal, NamedKey>, TissueContext>;
  context: Context;
}

export interface TissueInitialSignal<Context = any> {
  key: undefined;
  cellInfo: undefined;
  context: Context;
}

export type TissueSignal<
  Modal extends TissueDataModal = TissueDataModal,
  Context = any,
  TissueContext = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>
> = TissueBaseSignal<Modal, Context, TissueContext, NamedKey> | TissueInitialSignal<Context>;

export interface TissueListenBaseOptions<
  Modal extends TissueDataModal = TissueDataModal,
  Context = any,
  TissueContext = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>,
  CellValue extends TissueModalKeyByParams<Modal, NamedKey> = TissueModalKeyByParams<
    Modal,
    NamedKey
  >
> extends Omit<DataCellListenBaseOptions<CellValue, Context>, 'extraFilter'> {
  keys: Array<NamedKey>;
  extraFilter?: (notice: TissueSignal<Modal, Context, TissueContext, NamedKey>) => boolean;
}

export interface TissueSignalHandler<
  Modal extends TissueDataModal = TissueDataModal,
  Context = any,
  TissueContext = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>
> {
  (signal: TissueSignal<Modal, Context, TissueContext, NamedKey>): any;
}

export interface TissueListenOptions<
  Modal extends TissueDataModal = TissueDataModal,
  Context = any,
  TissueContext = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>
> extends TissueListenBaseOptions<Modal, Context, TissueContext, NamedKey> {
  immediate?: boolean;
}

export interface TissueGlobListenOptions<
  Modal extends TissueDataModal = TissueDataModal,
  Context = any,
  TissueContext = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>
> extends Omit<
    TissueListenOptions<Modal, Context, TissueContext, NamedKey>,
    'keys' | 'debounceTime'
  > {
  debounceTime?: number;
}

export type TissueValueInit<T = TissueValue> = T | Promise<T>;

export type TissueInitValueHandler<T = TissueValue> = () => TissueValueInit<T>;

export type TissueInitValueParam<T = TissueValue> = T | TissueInitValueHandler<T>;

export interface TissueDataCellInitFailInfo<
  NamedKey extends TissueKey = TissueKey,
  CellValue extends TissueValue = TissueValue
> {
  key: NamedKey;
  initialValue?: TissueInitValueParam<CellValue>;
  error: any;
}

export interface TissueInitHandler<
  NamedKey extends TissueKey = TissueKey,
  CellValue extends TissueValue = TissueValue
> {
  (cellKey: NamedKey, initialValue?: TissueInitValueParam<CellValue>):
    | CellValue
    | Promise<CellValue>;
}

export interface TissueHooks<
  Modal extends TissueDataModal = TissueDataModal,
  Context extends any = any,
  TissueContext extends any = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>,
  CellValue extends TissueModalKeyByParams<Modal, NamedKey> = TissueModalKeyByParams<
    Modal,
    NamedKey
  >
> extends BaseServiceHooks {
  beforeCellDestroy: (
    context: HookRunnerContext<{
      key: NamedKey;
      /**
       * @description 该key已实例化的DataCell实例，可能没有。（异步初始化，没初始化完成就clear）
       */
      cell?: DataCell<CellValue, TissueContext>;
      /**
       * @description 该key对应的实例是否没初始化完成就被clear了。
       */
      isInterruptInit: boolean;
    }>
  ) => void;
}

export interface TissueSelfOptions<
  Modal extends TissueDataModal = TissueDataModal,
  TissueContext extends any = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>,
  CellValue extends TissueModalKeyByParams<Modal, NamedKey> = TissueModalKeyByParams<
    Modal,
    NamedKey
  >
> {
  /**
   * @description 手动初始化DataCell的函数。
   */
  initHandler?: TissueInitHandler<NamedKey, CellValue>;
  /**
   * @description 每个子DataCell初始化时能继承的options
   */
  cellOptions?: DataCellInitOptions<CellValue, TissueContext>;
}

export interface TissueOptions<
  Modal extends TissueDataModal = TissueDataModal,
  Context extends any = any,
  TissueContext extends any = any
> extends BaseServiceOptions<TissueHooks<Modal, Context, TissueContext>, Context>,
    TissueSelfOptions<Modal, TissueContext> {}

export interface TissueInitOptions<
  Modal extends TissueDataModal = TissueDataModal,
  Context extends any = any,
  TissueContext extends any = any
> extends Omit<
      BaseServiceInitOptions<TissueHooks<Modal, Context, TissueContext>, Context>,
      'deferredInit'
    >,
    Partial<TissueSelfOptions<Modal, TissueContext>> {}

export interface TissueObservableResult<
  Modal extends TissueDataModal = TissueDataModal,
  Context = any,
  TissueContext = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>
> {
  /* 当前的listen是否处于暂停的状态 */
  suspended: boolean;
  /* listen的rx observable对象 */
  observable$: Observable<TissueSignal<Modal, Context, TissueContext, NamedKey>>;
  /* 强制以最后一次的notice触发一次listen的回调 */
  forceTrigger: () => void;
  /* 暂停该listen的callback回调触发 */
  suspend: () => void;
  /* 重启当前listen的callback回调触发 */
  restart: (immediateWhenRestart?: boolean) => void;
}

export interface TissueListenResult<
  Modal extends TissueDataModal = TissueDataModal,
  Context = any,
  TissueContext = any,
  NamedKey extends TissueModalKey<Modal> = TissueModalKey<Modal>
> extends Pick<
    TissueObservableResult<Modal, Context, TissueContext, NamedKey>,
    'suspend' | 'restart' | 'suspended'
  > {
  unsubscribe: () => void;
}

// 类型辅助定义
export type GetTissueModal<T extends StateTissue> = T extends StateTissue<infer A> ? A : any;
export type GetTissueContext<T extends StateTissue> = T extends StateTissue<infer A, infer B>
  ? B
  : any;
export type GetTissueCellContext<T extends StateTissue> = T extends StateTissue<
  infer A,
  infer B,
  infer C
>
  ? C
  : any;
export type GetTissueKey<T extends StateTissue> = T extends StateTissue<
  infer A,
  infer B,
  infer C,
  infer D
>
  ? D
  : any;
export type GetTissueValue<T extends StateTissue> = T extends StateTissue<
  infer A,
  infer B,
  infer C,
  infer D,
  infer E
>
  ? E
  : any;
export type GetTissueSignalHandler<
  T extends StateTissue,
  ParamsKey extends GetTissueKey<T>
> = T extends StateTissue<infer Modal, infer BoxContext, infer Context>
  ? TissueSignalHandler<Modal, BoxContext, Context, ParamsKey>
  : any;
export type GetTissueListenOptions<
  T extends StateTissue,
  ParamsKey extends GetTissueKey<T>
> = T extends StateTissue<infer Modal, infer BoxContext, infer Context>
  ? TissueListenResult<Modal, BoxContext, Context, ParamsKey>
  : any;

// DataCell存储信息类型
export type CellStoreInfo<CellValue, CellContext> = {
  cell: DataCell<CellValue, CellContext>;
  subscription: Subscription;
  listener: {
    observable$: Observable<DataCellSignal<CellValue, CellContext>>;
    forceTrigger: () => void;
    suspend: () => void;
    restart: (immediateWhenRestart?: boolean) => void;
  };
};
