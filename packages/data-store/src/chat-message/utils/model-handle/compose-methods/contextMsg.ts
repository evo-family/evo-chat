import { ChatMessage } from '@/chat-message/chatMessage';
import { IModelParams } from '@evo/types';
import { TComposedContexts } from '@/chat-message/types';

export const composeContextMsg = async (
  historyMessages: ChatMessage[],
  params: Pick<IModelParams, 'context_count'>
) => {
  const { context_count = 1 } = params;
  const collectContext: TComposedContexts[] = [];
  const sliceHistoryMsg = context_count ? historyMessages.slice(-context_count) : [];

  let currentTimes = context_count;

  for await (const msgIns of sliceHistoryMsg) {
    if (!currentTimes--) break;

    await msgIns.ready();
    const msgInfo = msgIns.configState.get();

    msgIns.modelAnswers.getCellsValue({ all: true }).map.forEach((answerData) => {
      const content = answerData?.content;
      if (!content) return;

      collectContext.push([
        {
          role: 'user',
          content: msgInfo.sendMessage,
        },
        {
          role: 'assistant',
          content,
        },
      ]);
    });
  }

  return collectContext.flatMap((value) => (value ? value : []));
};
