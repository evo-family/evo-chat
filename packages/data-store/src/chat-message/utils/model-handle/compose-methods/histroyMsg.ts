import { ChatMessage } from '@/chat-message/chatMessage';
import { IModelParams } from '@evo/types';
import { TComposedContexts } from '@/chat-message/types';
import { XMLBuilder } from 'fast-xml-parser';

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
    const msgInfo = msgIns.configState.get();

    msgIns.modelAnswers.getCellsValue({ all: true }).map.forEach((answerData) => {
      collectContext.push([
        {
          role: 'user',
          content: msgInfo.sendMessage,
        },
      ]);

      if (answerData?.type === 'mcp') {
        answerData.mcpExchanges.map((mcpRecord) => {
          const { content: mcpContent, mcpExecuteResult } = mcpRecord;
          mcpContent &&
            collectContext.push([
              {
                role: 'assistant',
                content: mcpContent,
              },
            ]);

          if (mcpExecuteResult) {
            const builder = new XMLBuilder({
              ignoreAttributes: false,
            });

            collectContext.push([
              {
                role: 'user',
                content: mcpExecuteResult
                  .map((item) =>
                    builder.build({
                      tool_use_result: {
                        mcp_id: item.mcp_id,
                        name: item.name,
                        result: item.result.map((data) => data.data).join(','),
                      },
                    })
                  )
                  .join('\n'),
              },
            ]);
          }
        });
      }

      const content = answerData?.connResult.content;
      if (!content) return;

      collectContext.push([
        {
          role: 'assistant',
          content,
        },
      ]);
    });
  }

  return collectContext.flatMap((value) => (value ? value : []));
};
