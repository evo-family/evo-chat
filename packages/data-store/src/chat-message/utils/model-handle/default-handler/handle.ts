import { ChatCompletionMessageParam } from 'openai/resources/index.mjs';
import { EModalAnswerStatus } from '@/chat-message/types';
import { IBaseModelHandler } from '../types';
import { composeAgentsMsg } from './agent';
import { composeAttachment } from './attachment';
import { composeContextMsg } from './contextMsg';
import { composeUserMsg } from './user';
import { defaultStreamResolver } from './stream';
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

  const streamTask = defaultStreamResolver({ stream: result, answerCell });

  return { result, streamTask };
};
