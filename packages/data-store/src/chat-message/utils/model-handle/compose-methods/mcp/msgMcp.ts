import { TComposedContexts, TModelAnswer } from '@/chat-message/types';

import { KnowledgeBridgeFactory } from '@evo/platform-bridge';
import { XMLBuilder } from 'fast-xml-parser';

export const composeCurMsgMcp = async (params: { answerConfig: TModelAnswer }) => {
  const { answerConfig } = params;

  if (answerConfig.type !== 'mcp') return [];

  const composeResult: TComposedContexts = [];

  answerConfig.mcpExchanges.map((mcpRecord) => {
    const { content: mcpContent, mcpExecuteResult } = mcpRecord;
    mcpContent &&
      composeResult.push({
        role: 'assistant',
        content: mcpContent,
      });

    if (mcpExecuteResult) {
      const builder = new XMLBuilder({
        ignoreAttributes: false,
      });

      composeResult.push({
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
      });
    }
  });

  return composeResult;
};
