import {
  BaseServiceHooks,
  BaseServiceInitOptions,
  BaseServiceOptions,
  ChatOptions,
  DataCell,
  HookRunnerContext,
} from '@evo/utils';
import { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources';
import { EMCPExecuteMode, IFileMeta, IMCPCallToolResponse } from '@evo/types';

export enum EModalConnStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PENDING = 'pending',
  RECEIVING = 'receiving',
}

export enum EMCPExecuteStatus {
  PENDING = 'pending',
  SUCCESS = 'success',
  ERROR = 'error',
}

export interface IMCPExecuteRecord {
  mcp_id: string;
  tool_name: string;
  arguments: Record<any, any>;
  status: EMCPExecuteStatus;
  result?: IMCPCallToolResponse;
}

export interface IModelConnRecord {
  type: 'llm';
  errorMessage: string;
  content: string;
  reasoning_content: string;
  startReasoningTime?: number;
  endReasoningTime?: number;
  status: EModalConnStatus;
  usage?: ChatCompletionChunk['usage'];
  sendMessage: string;
  mcpInfo: {
    mcpExecuteMode: EMCPExecuteMode;
    executeRecords: Array<IMCPExecuteRecord>;
  };
}

export type TChatTurnItem = IModelConnRecord;

export interface IModelAnserActionRecord {
  chatTurns: TChatTurnItem[];
}

export enum EChatAnswerStatus {
  PENDING = 'pending',
  END = 'end',
}

export interface IModelBaseAnswer {
  id: string;
  model: string;
  provider: string;
  createdTime?: number;
  status: EChatAnswerStatus;
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
