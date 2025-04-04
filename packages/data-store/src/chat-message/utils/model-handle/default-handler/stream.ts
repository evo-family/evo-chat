import { ChatResponse, DataCell } from '@evo/utils';
import { EModalAnswerStatus, TModelAnswerCell } from '@/chat-message/types';

const updateReasoningTimestamps = (
  curData: ReturnType<TModelAnswerCell['get']>,
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

export const defaultStreamResolver = async (params: {
  stream: ChatResponse<true>;
  answerCell: TModelAnswerCell;
}) => {
  const { stream, answerCell } = params;

  for await (const content of stream) {
    const { usage, choices } = content;
    const curData = answerCell.get();

    // 更新接收状态
    if (curData.status === EModalAnswerStatus.PENDING) {
      curData.status = EModalAnswerStatus.RECEIVING;
    }

    // 处理每个选项的内容
    choices.forEach((choice) => {
      // @ts-ignore
      const { content: deltaContent, reasoning_content: deltaReasoningContent } = choice.delta;

      if (deltaContent) curData.content += deltaContent;
      if (deltaReasoningContent) curData.reasoning_content += deltaReasoningContent;

      updateReasoningTimestamps(curData, deltaContent, deltaReasoningContent);
    });

    // 更新使用量统计
    if (usage) {
      curData.usage = usage;
    }

    answerCell.set(curData);
  }
};
