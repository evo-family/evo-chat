import { HookExecutorSysHooks, HookRunnerContext } from '../hook-executor/types';

export interface BaseServiceHooks extends HookExecutorSysHooks {
  prepare: (context: HookRunnerContext) => any;
  serviceReady: (context: HookRunnerContext) => any;
  destroy: (context: HookRunnerContext) => any;
  error: (context: HookRunnerContext) => any;
}

export interface BaseServiceOptions<
  H extends BaseServiceHooks = BaseServiceHooks,
  R extends any = any
> {
  // 初始化的hooks对象
  hooks: H;
  // 该实例是否为异步初始化，会影响ready的逻辑。针对同步初始化的service做了性能优化。
  deferredInit: boolean;
  // 初始化的上下文，纯粹为拓展方预留
  context: R;
}

export interface BaseServiceInitOptions<
  H extends BaseServiceHooks = BaseServiceHooks,
  R extends any = any
> extends Partial<BaseServiceOptions<any, R>> {
  hooks?: Partial<H>;
}
