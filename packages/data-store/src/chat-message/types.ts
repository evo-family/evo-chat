import {
  BaseServiceHooks,
  BaseServiceInitOptions,
  BaseServiceOptions,
  ChatOptions,
  DataCell,
  HookRunnerContext,
} from '@evo/utils';
import { ChatCompletionChunk, ChatCompletionMessageParam } from 'openai/resources';

import { IFileMeta } from '@evo/types';

export enum EModalAnswerStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PENDING = 'pending',
  RECEIVING = 'receiving',
}

export interface IModelBaseAnswer {
  id: string;
  model: string;
  provider: string;
  content: string;
  reasoning_content: string;
  startReasoningTime?: number;
  endReasoningTime?: number;
  status: EModalAnswerStatus;
  createdTime?: number;
  usage?: ChatCompletionChunk['usage'];
  errorMessage: string;
}

export type TModelAnswer = IModelBaseAnswer;

export interface IMessageConfig {
  id: string;
  createdTime: number;
  providers: { name: string; model: string }[];
  sendMessage: string;
  attachFileInfos: IFileMeta[];
  answerIds: string[];
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
