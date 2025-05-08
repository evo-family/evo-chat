import {
  BaseServiceHooks,
  BaseServiceInitOptions,
  BaseServiceOptions,
  ChatOptions,
  DataCell,
  HookRunnerContext,
} from '@evo/utils';
import { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources';
import { IFileMeta, IMCPCallToolResponse } from '@evo/types';

export enum EModalAnswerStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PENDING = 'pending',
  RECEIVING = 'receiving',
}

export interface IModelConnRecord {
  type: 'llm';
  errorMessage: string;
  content: string;
  reasoning_content: string;
  startReasoningTime?: number;
  endReasoningTime?: number;
  status: EModalAnswerStatus;
  usage?: ChatCompletionChunk['usage'];
  sendMessage: string;
  mcpInfo: {
    executeParams: Array<{
      mcp_id: string;
      name: string;
      arguments: Record<any, any>;
    }>;
    executeResult: Array<{
      mcp_id: string;
      name: string;
      result: IMCPCallToolResponse;
    }>;
  };
}

export type TChatTurnItem = IModelConnRecord;

export interface IModelAnserActionRecord {
  chatTurns: TChatTurnItem[];
}

export interface IModelBaseAnswer {
  id: string;
  model: string;
  provider: string;
  createdTime?: number;
  histroy: IModelAnserActionRecord[];
}

export type TModelAnswer = IModelBaseAnswer;

export interface IMessageConfig {
  id: string;
  sendMessage: string;
  createdTime: number;
  providers: { name: string; model: string }[];
  answerIds: string[];
  attachFileInfos?: IFileMeta[];
  mcpIds?: string[];
}

export interface IChatMessageHooks extends BaseServiceHooks {
  init: (context: HookRunnerContext) => any;
}

export interface IChatMessageSelfOptions {
  id: IMessageConfig['id'];
}

export interface IChatMessageOptions<Context>
  extends BaseServiceOptions<IChatMessageHooks, Context>,
    IChatMessageSelfOptions {}

export interface IChatMessageInitOptions<Context>
  extends BaseServiceInitOptions<IChatMessageHooks, Context>,
    IChatMessageSelfOptions {}

export type TModelAnswerCell = DataCell<TModelAnswer>;

export type TPostMessageOptions = Omit<ChatOptions, 'model'>;

export type TComposedContexts = ChatCompletionMessageParam[];
