import { EModalAnswerStatus, IModelBaseAnswer, IModelConnRecord } from '../types';

export const getEmptyModelConnResult = (sendMessage: string = ''): IModelConnRecord => ({
  type: 'llm',
  sendMessage,
  status: EModalAnswerStatus.PENDING,
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
    executeParams: [],
    executeResult: [],
  },
});

export const getEmptyAnswerData = (): Pick<IModelBaseAnswer, 'createdTime' | 'histroy'> => ({
  createdTime: +Date.now(),
  histroy: [],
});
