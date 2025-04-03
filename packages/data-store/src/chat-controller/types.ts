import { IChatWindowSelfOptions } from '@/chat-window/types';
import {
  BaseServiceHooks,
  BaseServiceInitOptions,
  BaseServiceOptions,
  HookRunnerContext,
} from '@evo/utils';

export type TInitialWindowConfig = Omit<IChatWindowSelfOptions['config'], 'id'>;

export interface IChatCtrlWindowRecord {
  initialConfig?: TInitialWindowConfig;
}

export interface IChatControllerHooks extends BaseServiceHooks {
  init: (context: HookRunnerContext) => any;
}

export interface IChatControllerSelfOptions {}

export interface IChatControllerOptions<Context>
  extends BaseServiceOptions<IChatControllerHooks, Context>,
    IChatControllerSelfOptions {}

export interface IChatControllerInitOptions<Context>
  extends BaseServiceInitOptions<IChatControllerHooks, Context>,
    IChatControllerSelfOptions {}
