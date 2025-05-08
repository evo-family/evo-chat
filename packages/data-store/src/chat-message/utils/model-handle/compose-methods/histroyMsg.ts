import { ChatMessage } from '@/chat-message/chatMessage';
import { IModelParams } from '@evo/types';
import { TComposedContexts } from '@/chat-message/types';

export const composeHistoryMsg = async (
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

    msgIns.modelAnswers.getCellsValue({ all: true }).map.forEach((answerData) => {
      if (answerData?.chatTurns.length) {
        answerData.chatTurns.map((turnItem) => {
          const { sendMessage, content } = turnItem;

          collectContext.push([
            {
              role: 'user',
              content: sendMessage,
            },
          ]);

          content &&
            collectContext.push([
              {
                role: 'assistant',
                content,
              },
            ]);
        });
      }
    });
  }

  return collectContext.flatMap((value) => (value ? value : []));
};
