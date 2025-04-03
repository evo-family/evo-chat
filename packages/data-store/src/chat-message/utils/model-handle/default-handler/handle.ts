import { EModalAnswerStatus, TComposedContexts } from '@/chat-message/types';

import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { IBaseModelHandler } from '../types';
import { composeAgentsMsg } from './agent';
import { composeAttachment } from './attachment';
import { composeContextMsg } from './contextMsg';
import { composeUserMsg } from './user';
import { modelProcessor } from '../../../../processor';

export const defaultMsgSend: IBaseModelHandler = async (conn, params) => {
  const {
    msgConfig,
    answerCell,
    composedContexts,
    historyMessages = [],
    knowledgeIds,
    agentIds,
  } = params;
  const { sendMessage, attachFileInfos } = msgConfig;

  // 使用模型参数
  const modelParams = modelProcessor.modelParams.get();
  const { context_count } = modelParams;

  const [lastContext, agentContext, attachContext, userContext] = await Promise.all([
    composeContextMsg(historyMessages, { context_count }),
    composeAgentsMsg({ agentIds }),
    composeAttachment({ fileInfos: attachFileInfos }),
    composeUserMsg({ msgConfig, knowledgeIds }),
  ]);

  const composeMessages: ChatCompletionMessageParam[] = (composedContexts ?? []).concat(
    lastContext,
    agentContext,
    attachContext,
    userContext
  );

  const answerConfig = answerCell.get();

  const result = await conn.chat(composeMessages, {
    stream: true,
    model: answerConfig.model,
    ...modelParams,
  });

  const pipeTask = new Promise(async (resolve) => {
    let first = true;

    for await (const content of result) {
      const choice = content.choices?.at(0);
      const currentCellValue = answerCell.get();

      if (first) {
        first = false;
        currentCellValue.status = EModalAnswerStatus.RECEIVING;
      }

      if (choice) {
        const deltaContent = choice.delta?.content;
        // @ts-ignore
        const deltaReasoningContent = choice.delta?.reasoning_content;

        currentCellValue.content += deltaContent || '';
        currentCellValue.reasoning_content += deltaReasoningContent || '';

        // 如果是初次接收消息，且接收消息时候有返回reasoning_content数据，可判定为第一次接收思维链
        if (deltaReasoningContent && !currentCellValue.startReasoningTime) {
          currentCellValue.startReasoningTime = +Date.now();
        }

        // 如果deltaContent有值，且当前answer数据中startReasoningTime有值，且当前answer数据中endReasoningTime没有设置值，可判定为思维链已经完成。
        if (
          deltaContent &&
          currentCellValue.startReasoningTime &&
          !currentCellValue.endReasoningTime
        ) {
          currentCellValue.endReasoningTime = +Date.now();
        }
      }

      if (content.usage) {
        currentCellValue.usage = content.usage;
      }

      answerCell.set(currentCellValue);
    }

    resolve(undefined);
  });

  return { result, pipeTask };
};
