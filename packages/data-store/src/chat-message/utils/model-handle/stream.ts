import { ChatResponse, DataCell } from '@evo/utils';
import { EModalConnStatus, IModelConnRecord, TModelAnswerCell } from '@/chat-message/types';

import { IModelConnParams } from './types';

const updateReasoningTimestamps = (
  curData: IModelConnRecord,
  deltaContent?: string | null,
  deltaReasoningContent?: string
) => {
  // 首次接收思维链
  if (deltaReasoningContent && !curData.startReasoningTime) {
    curData.startReasoningTime = +Date.now();
  }

  // 思维链结束
  if (deltaContent && curData.startReasoningTime && !curData.endReasoningTime) {
    curData.endReasoningTime = +Date.now();
  }
};

export const defaultStreamResolver = async (
  params: {
    stream: ChatResponse<true>;
    connResult: IModelConnRecord;
  } & Pick<IModelConnParams, 'onResolve'>
) => {
  const { stream, connResult, onResolve } = params;

  for await (const content of stream) {
    const { usage, choices } = content;

    // 更新接收状态
    if (connResult.status === EModalConnStatus.PENDING) {
      connResult.status = EModalConnStatus.RECEIVING;
    }

    // 处理每个选项的内容
    choices.forEach((choice) => {
      // @ts-ignore
      const { content: deltaContent, reasoning_content: deltaReasoningContent } = choice.delta;

      if (deltaContent) connResult.content += deltaContent;
      if (deltaReasoningContent) connResult.reasoning_content += deltaReasoningContent;

      updateReasoningTimestamps(connResult, deltaContent, deltaReasoningContent);
    });

    // 更新使用量统计
    if (usage) {
      connResult.usage = usage;
    }

    onResolve?.(connResult);
  }

  return connResult;
};
