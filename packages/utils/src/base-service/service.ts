import { BaseServiceInitOptions, BaseServiceOptions } from './types';
import { PromiseWrap, generatePromiseWrap, isPromise } from '../utils/common';

import { HookExecutor } from '../hook-executor/executor';
import { HookRunnerContext } from '../hook-executor/types';

const MESSAGES = {
  HOOK_INTERCEPT: `Operation intercepted by hook: `,
  SERVICE_DESTROYED: 'Service instance has been destroyed. Further operations are not permitted.',
  OPERATION_REJECTED: 'Operation rejected: ',
} as const;

export class BaseService<Options extends BaseServiceOptions> extends HookExecutor<
  Options['hooks']
> {
  // 状态相关属性
  deferredInitTask: PromiseWrap | undefined;
  destroyed: boolean = false;
  executingDestroy: boolean = false;

  // 配置相关属性
  protected options: Options;
  context: Options['context'];
  protected destroyedRemind: string = MESSAGES.SERVICE_DESTROYED;
  protected destroyCleanups: Array<Function> = [];

  constructor(options: BaseServiceInitOptions = {}) {
    const { hooks, deferredInit = true } = options;
    super(hooks);

    this.options = options as Options;
    this.context = this.options.context;

    this.setupInitialization(deferredInit);
  }

  private setupInitialization(deferredInit: boolean) {
    if (!deferredInit) {
      this.execute('serviceReady');
      return;
    }

    this.deferredInitTask = generatePromiseWrap();
    this.deferredInitTask.promise
      .then(() => this.execute('serviceReady'))
      .catch(this.handleInitError);
  }

  private handleInitError = (error: any) => {
    this.execute('error', error);
    this.destroy();
  };

  // 公共接口
  get isReady(): boolean {
    return this.deferredInitTask?.state === 'fulfilled';
  }

  async ready(): Promise<any> {
    if (this.destroyed) {
      return Promise.reject(`${MESSAGES.OPERATION_REJECTED}${this.destroyedRemind}`);
    }
    return this.deferredInitTask?.promise ?? Promise.resolve();
  }

  destroy() {
    if (this.destroyed) return;

    this.executingDestroy = true;
    this.execute('destroy');
    this.performCleanup();
    this.finalizeDestroy();
  }

  // 清理相关方法
  private performCleanup() {
    this.destroyCleanups.forEach((handle) => handle?.());
    this.handleCleanup();
  }

  private finalizeDestroy() {
    this.destroyed = true;
    this.cleanHooks();
    this.destroyCleanups.length = 0;
  }

  protected handleCleanup() {}

  // Hook 上下文处理
  private handleHookContextValidation(contexts: HookRunnerContext[]): boolean {
    return contexts.every((context) => (!isPromise(context) ? context.valid : true));
  }

  private handlePromiseTask<T extends HookRunnerContext[]>(
    contexts: T,
    isValid: boolean,
    promiseTask?: PromiseWrap<T>
  ) {
    if (isValid) {
      promiseTask?.resolve(contexts);
    } else {
      promiseTask?.reject(contexts);
    }
    return promiseTask?.promise;
  }

  handleHookContexts<T extends HookRunnerContext[]>(params: {
    contexts: T;
    doAction?: (contexts: T) => void;
    undoAction?: (contexts: T) => void;
    finallyAction?: (contexts: T) => void;
    getPromise?: false;
  }): undefined;
  handleHookContexts<T extends HookRunnerContext[]>(params: {
    contexts: T;
    getPromise?: true;
  }): PromiseWrap<T>['promise'];
  handleHookContexts<T extends HookRunnerContext[]>({
    contexts,
    doAction,
    undoAction = (options: HookRunnerContext[]) => {
      const lastContext = options.at(-1);
      lastContext && console.warn(MESSAGES.HOOK_INTERCEPT + lastContext.hookName);
    },
    finallyAction,
    getPromise = false,
  }: {
    contexts: T;
    doAction?: (contexts: T) => void;
    undoAction?: (contexts: T) => void;
    finallyAction?: (contexts: T) => void;
    getPromise?: boolean;
  }) {
    const isValidAction = this.handleHookContextValidation(contexts);
    const promiseTask = getPromise ? generatePromiseWrap<T>() : undefined;

    if (isValidAction && !promiseTask) {
      doAction?.(contexts as T);
    } else if (!isValidAction && !promiseTask) {
      undoAction?.(contexts as T);
    }

    const result = this.handlePromiseTask(contexts, isValidAction, promiseTask);
    if (!result) {
      finallyAction?.(contexts as T);
    }
    return result;
  }
}
