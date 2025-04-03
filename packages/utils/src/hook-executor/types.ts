export enum HookExecuteMode {
  FOREACH = 'forEach',
  REDUCE = 'reduce',
}

export interface ExecuteOptions {
  order?: number;
  once?: boolean;
  times?: number;
}

export interface HookRecord extends ExecuteOptions {
  hookHandler: (...args: any) => any;
  executeCount: number;
}

export interface HookExecuteOptions {
  mode?: HookExecuteMode;
  async?: boolean;
  lockData?: boolean;
}

export interface HookRunnerContext<T = any>
  extends HookExecuteOptions,
    Omit<HookRecord, 'hookHandler'> {
  valid: boolean;
  data: T;
  hookName: any;
}

export interface HookExecutorSysHooks {
  snapshotHooks: (context: HookRunnerContext<Map<any, Array<HookRecord>>>) => void;
  afterSnapshotHooks: (context: HookRunnerContext<Map<any, Array<HookRecord>>>) => void;
  restoreHooks: (context: HookRunnerContext<Map<any, Array<HookRecord>>>) => void;
  afterRestoreHooks: (context: HookRunnerContext<Map<any, Array<HookRecord>>>) => void;
}

export interface HookExecutorInitOptions extends Partial<HookExecutorSysHooks> {}

export type HookExecutedResult<Item> = Item extends (param: infer A) => any ? A : any;

export interface HookRunner<T> {
  hookHandler: Function;
  context: HookRunnerContext<T>;
  isReduceMode?: boolean;
  allowAsyncHook: boolean;
  lastContext: any;
  results: (Promise<HookRunnerContext<T>> | HookRunnerContext<T>)[];
}
