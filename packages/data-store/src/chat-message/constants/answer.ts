import { EChatAnswerStatus, EModalConnStatus, IModelBaseAnswer, IModelConnRecord } from '../types';

import { EMCPExecuteMode } from '@evo/types';
import { TUserContent } from '../utils/model-handle/types';

export const getEmptyModelConnResult = (
  params: Partial<{
    userContent: TUserContent;
    mcpExecuteMode: EMCPExecuteMode;
  }>
): IModelConnRecord => {
  const { userContent, mcpExecuteMode = EMCPExecuteMode.FUNCTION_CALL } = params;

  let sendMessage = '';
  if (typeof userContent === 'string') {
    sendMessage = userContent;
  }

  return {
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
      mcpExecuteMode,
      executeRecords: [],
    },
  };
};

export const getEmptyAnswerData = (): Pick<
  IModelBaseAnswer,
  'createdTime' | 'histroy' | 'status'
> => ({
  createdTime: +Date.now(),
  histroy: [],
  status: EChatAnswerStatus.PENDING,
});
