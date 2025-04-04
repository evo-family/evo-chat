import { ChatResponse, DataCell, OpenAiClient } from '@evo/utils';
import { IMessageConfig, TComposedContexts, TModelAnswer, TModelAnswerCell } from '../../types';

import { ChatMessage } from '@/chat-message/chatMessage';
import { IChatWindowConfig } from '@/chat-window/types';

export interface IModelConnHandleBaseParams
  extends Pick<IChatWindowConfig, 'agentIds' | 'knowledgeIds'> {
  composedContexts?: TComposedContexts;
  historyMessages?: ChatMessage[];
}

export interface IModelConnHandleParams extends IModelConnHandleBaseParams {
  msgConfig: IMessageConfig;
  answerCell: TModelAnswerCell;
}

export interface IModelConnHandle {
  (params: IModelConnHandleParams): Promise<{
    result: ChatResponse<true>;
    streamTask: Promise<any>;
  }>;
}

export interface IBaseModelHandler {
  (conn: OpenAiClient, ...args: Parameters<IModelConnHandle>): ReturnType<IModelConnHandle>;
}
