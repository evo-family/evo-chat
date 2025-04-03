import { EModalAnswerStatus, IModelBaseAnswer } from '../types';

export const getEmptyAnswerData = (): Pick<
  IModelBaseAnswer,
  | 'status'
  | 'content'
  | 'reasoning_content'
  | 'errorMessage'
  | 'usage'
  | 'createdTime'
  | 'startReasoningTime'
  | 'endReasoningTime'
> => ({
  status: EModalAnswerStatus.PENDING,
  content: '',
  reasoning_content: '',
  errorMessage: '',
  createdTime: +Date.now(),
  startReasoningTime: undefined,
  endReasoningTime: undefined,
  usage: {
    prompt_tokens: 0,
    completion_tokens: 0,
    total_tokens: 0,
  },
});
