import { ChatResponse, DataCell, OpenAiClient, PromiseWrap } from '@evo/utils';
import { IMcpToolsOptions, getMcpTools } from './mcp';
import {
  IMessageConfig,
  IModelAnserActionRecord,
  IModelConnRecord,
  TComposedContexts,
  TModelAnswer,
  TModelAnswerCell,
} from '../../types';

import { ChatCompletionMessageParam } from 'openai/resources.mjs';
import { ChatMessage } from '@/chat-message/chatMessage';
import { EMCPExecuteMode } from '@evo/types';
import { IChatWindowConfig } from '@/chat-window/types';
import { composeModelConnContext } from './modelConnContext';

export type TUserContent = string | ChatCompletionMessageParam[];

export interface IComposeModelContextParams
  extends Pick<Partial<IChatWindowConfig>, 'agentIds' | 'knowledgeIds' | 'mcpIds'> {
  composedContexts?: TComposedContexts;
  historyMessages?: ChatMessage[];
  mcpToolsOptions?: IMcpToolsOptions;
  mcpExecuteMode?: EMCPExecuteMode;
  msgConfig: IMessageConfig;
  answerConfig: TModelAnswer;
}

export type TPostMessageParams = Omit<
  IComposeModelContextParams,
  'msgConfig' | 'answerConfig' | 'mcpToolsOptions'
>;

export interface IModelConnParams
  extends Pick<
    IComposeModelContextParams,
    'mcpToolsOptions' | 'mcpExecuteMode' | 'msgConfig' | 'answerConfig'
  > {
  getMessageContext: () => ReturnType<typeof composeModelConnContext>;
  userContent: TUserContent;
  actionRecord: IModelAnserActionRecord;
  taskSignal: PromiseWrap;
  onResolve?: (value: IModelConnRecord) => void;
}

export interface IModelConnHandle {
  (params: IModelConnParams): Promise<IModelConnRecord>;
}

export interface IBaseModelHandler {
  (conn: OpenAiClient, ...args: Parameters<IModelConnHandle>): ReturnType<IModelConnHandle>;
}
