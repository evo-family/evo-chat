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
  startReasoningTime?: number;
  endReasoningTime?: number;
  content: string;
  reasoning_content: string;
  status: EModalAnswerStatus;
  usage?: ChatCompletionChunk['usage'];
  errorMessage: string;
}

export interface IModelBaseAnswer {
  id: string;
  model: string;
  provider: string;
  createdTime?: number;
  connResult: IModelConnRecord;
}

export interface INormalAnswer extends IModelBaseAnswer {
  type: 'normal';
}

export interface IMCPExchangeItem extends IModelConnRecord {
  mcpExecuteParams: Array<{
    mcp_id: string;
    name: string;
    arguments: Record<any, any>;
  }>;
  mcpExecuteResult: Array<{
    mcp_id: string;
    name: string;
    result: IMCPCallToolResponse['content'];
  }>;
}

export interface IMCPModelAnswer extends IModelBaseAnswer {
  type: 'mcp';
  mcpExchanges: Array<IMCPExchangeItem>;
}

export type TModelAnswer = INormalAnswer | IMCPModelAnswer;

export interface IMessageConfig {
  id: string;
  createdTime: number;
  providers: { name: string; model: string }[];
  sendMessage: string;
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
