import { ChatResponse, DataCell, OpenAiClient, PromiseWrap } from '@evo/utils';
import {
  IMessageConfig,
  IModelConnRecord,
  TComposedContexts,
  TModelAnswer,
  TModelAnswerCell,
} from '../../types';

import { ChatCompletionMessageParam } from 'openai/resources.mjs';
import { ChatMessage } from '@/chat-message/chatMessage';
import { IChatWindowConfig } from '@/chat-window/types';

export interface IComposeModelContextParams
  extends Pick<Partial<IChatWindowConfig>, 'agentIds' | 'knowledgeIds' | 'mcpIds'> {
  composedContexts?: TComposedContexts;
  historyMessages?: ChatMessage[];
}

export interface IModelConnParams {
  getMessageContext: () => Promise<ChatCompletionMessageParam[]>;
  userContent: string;
  msgConfig: IMessageConfig;
  answerConfig: TModelAnswer;
  taskSignal: PromiseWrap;
  onResolve?: (value: IModelConnRecord) => void;
  firstResolve?: (value: IModelConnRecord) => void;
}

export interface IModelConnHandle {
  (params: IModelConnParams): Promise<IModelConnRecord>;
}

export interface IBaseModelHandler {
  (conn: OpenAiClient, ...args: Parameters<IModelConnHandle>): ReturnType<IModelConnHandle>;
}
