import { EChatAnswerStatus, EModalConnStatus, IModelBaseAnswer, IModelConnRecord } from '../types';

export const getEmptyModelConnResult = (sendMessage: string = ''): IModelConnRecord => ({
  type: 'llm',
  sendMessage,
  status: EModalConnStatus.PENDING,
  content: '',
  reasoning_content: '',
  errorMessage: '',
  startReasoningTime: undefined,
  endReasoningTime: undefined,
  usage: {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  },
  mcpInfo: {
    executeRecords: [],
  },
});

export const getEmptyAnswerData = (): Pick<
  IModelBaseAnswer,
  'createdTime' | 'histroy' | 'status'
> => ({
  createdTime: +Date.now(),
  histroy: [],
  status: EChatAnswerStatus.PENDING,
});
