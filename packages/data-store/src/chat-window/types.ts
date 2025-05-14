import {
  BaseServiceHooks,
  BaseServiceInitOptions,
  BaseServiceOptions,
  HookRunnerContext,
  StateTissue,
} from '@evo/utils';
import { IAvailableModel, IKnowledgeMeta } from '@evo/types';

export interface IChatWindowConfig {
  id: string;
  createdTime: number;
  /**
   * 手动设置当前窗口标题
   */
  manualTitle?: string;
  messageIds: string[];
  /** 当前窗口使用的模型列表 */
  models: IAvailableModel[];
  /**
   * 当前窗口使用的知识库列表
   */
  knowledgeIds?: string[];

  /**
   * 当前窗口使用的MCP工具列表
   */
  mcpIds?: string[];
  /**
   * 当前窗口使用的助手列表
   */
  agentIds?: string[];
}

export interface IChatWindowHooks extends BaseServiceHooks {
  init: (context: HookRunnerContext) => any;
}

export interface IChatWindowSelfOptions {
  config: Partial<IChatWindowConfig> & Pick<IChatWindowConfig, 'id'>;
}

export interface IChatWindowOptions<Context>
  extends BaseServiceOptions<IChatWindowHooks, Context>,
    IChatWindowSelfOptions {}

export interface IChatWindowInitOptions<Context>
  extends BaseServiceInitOptions<IChatWindowHooks, Context>,
    IChatWindowSelfOptions {}

export type TChatWinConfigTissue = StateTissue<IChatWindowConfig>;
