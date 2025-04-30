import { EModalAnswerStatus, IModelBaseAnswer, IModelConnRecord } from '../types';

export const getEmptyModelConnResult = (): IModelConnRecord => ({
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
});

export const getEmptyAnswerData = (): Pick<IModelBaseAnswer, 'connResult' | 'createdTime'> => ({
  createdTime: +Date.now(),
  connResult: getEmptyModelConnResult(),
});
