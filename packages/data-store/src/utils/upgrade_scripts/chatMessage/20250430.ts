import { ChatCompletionChunk } from 'openai/resources.mjs';

enum EModalAnswerStatus {
  SUCCESS = 'success',
  ERROR = 'error',
  PENDING = 'pending',
  RECEIVING = 'receiving',
}

interface oldAnswerItem {
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

interface IModelConnRecord {
  startReasoningTime?: number;
  endReasoningTime?: number;
  content: string;
  reasoning_content: string;
  status: EModalAnswerStatus;
  usage?: ChatCompletionChunk['usage'];
  errorMessage: string;
}

interface IModelBaseAnswer {
  id: string;
  model: string;
  provider: string;
  createdTime?: number;
  connResult: IModelConnRecord;
}

interface INormalAnswer extends IModelBaseAnswer {
  type: 'normal';
}

export const fixChatMsg20250430 = (data: oldAnswerItem): INormalAnswer => {
  // @ts-ignore
  if (data.connResult) {
    return data as unknown as INormalAnswer;
  }

  const { id, model, provider, createdTime, ...restData } = data;

  const rebuildData: INormalAnswer = {
    id,
    model,
    provider,
    createdTime,
    type: 'normal',
    connResult: restData,
  };

  return rebuildData;
};
