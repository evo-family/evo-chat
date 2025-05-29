import { EMCPExecuteMode, IModelParams } from '@evo/types';
import { IModelConnRecord, TComposedContexts } from '@/chat-message/types';

import { ChatMessage } from '@/chat-message/chatMessage';
import { transMcpExecuteToXML } from './mcp/msgMcp';

export const pickMcpFunctionCallMsg = (
  turnItem: IModelConnRecord,
  params: {
    composeResult: TComposedContexts;
    mcpExecuteMode?: EMCPExecuteMode;
    skipSendMessage?: boolean;
  }
) => {
  const { sendMessage, content } = turnItem;
  const { composeResult, mcpExecuteMode, skipSendMessage } = params;

  if (!skipSendMessage) {
    sendMessage &&
      composeResult.push({
        role: 'user',
        content: sendMessage,
      });
  }

  content &&
    composeResult.push({
      role: 'assistant',
      content: content,
    });

  turnItem.mcpInfo.executeRecords.forEach((record) => {
    const { tool_name, result, arguments: exeArgs } = record;

    if (mcpExecuteMode === EMCPExecuteMode.COMPATIBLE) {
      const { toolUse, toolUseResult } = transMcpExecuteToXML({ executeRecord: record });

      toolUse &&
        composeResult.push({
          role: 'assistant',
          content: toolUse,
        });

      toolUseResult &&
        composeResult.push({
          role: 'user',
          content: toolUseResult,
        });
    } else {
      exeArgs &&
        composeResult.push({
          role: 'assistant',
          content: JSON.stringify({ functionName: tool_name, arguments: exeArgs }),
        });

      result?.content?.length &&
        composeResult.push({
          role: 'user',
          content: JSON.stringify({
            functionName: tool_name,
            executeResult: result.content.map((conItem) => conItem.text ?? '').join('\n'),
          }),
        });
    }
  });
};

export const composeHistoryMsg = async (
  historyMessages: ChatMessage[],
  params: Pick<IModelParams, 'context_count'> & { mcpExecuteMode?: EMCPExecuteMode }
) => {
  const { context_count = 1, mcpExecuteMode } = params;
  const composeResult: TComposedContexts = [];
  const sliceHistoryMsg = context_count ? historyMessages.slice(-context_count) : [];

  let currentTimes = context_count;

  for await (const msgIns of sliceHistoryMsg) {
    if (!currentTimes--) break;

    await msgIns.ready();

    msgIns.modelAnswers.getCellsValue({ all: true }).map.forEach((answerData) => {
      const targetChatTurn = answerData?.histroy.at(-1)?.chatTurns;

      targetChatTurn?.map((turnItem) => {
        pickMcpFunctionCallMsg(turnItem, { composeResult, mcpExecuteMode });
      });
    });
  }

  return composeResult.flatMap((value) => (value ? value : []));
};
