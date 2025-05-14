import { IMessageConfig, TModelAnswer } from '@/chat-message/types';

import { ChatCompletionMessageParam } from 'openai/resources.mjs';
import { IComposeModelContextParams } from './types';
import { composeAgentsMsg } from './compose-methods/agent';
import { composeAttachment } from './compose-methods/attachment';
import { composeHistoryMsg } from './compose-methods/histroyMsg';
import { composeMcpTools } from './compose-methods/mcp/mcp';
import { composeUserMsg } from './compose-methods/user';
import { modelProcessor } from '@/processor/model-processor';

export const composeModelConnContext = async (
  params: IComposeModelContextParams & { msgConfig: IMessageConfig; answerConfig: TModelAnswer }
): Promise<ChatCompletionMessageParam[]> => {
  const {
    msgConfig,
    answerConfig,
    composedContexts,
    historyMessages = [],
    knowledgeIds,
    agentIds,
    mcpIds,
  } = params;
  const { attachFileInfos } = msgConfig;

  // 使用模型参数
  const modelParams = modelProcessor.modelParams.get();
  const { context_count } = modelParams;

  const [lastContext, agentContext, attachContext, userContext, mcpTools] = await Promise.all([
    composeHistoryMsg(historyMessages, { context_count }),
    composeAgentsMsg({ agentIds }),
    composeAttachment({ fileInfos: attachFileInfos }),
    composeUserMsg({ answerConfig, knowledgeIds }),
    composeMcpTools({ mcpIds }),
  ]);

  const composeMessages: ChatCompletionMessageParam[] = (composedContexts ?? []).concat(
    agentContext,
    mcpTools,
    lastContext,
    attachContext,
    userContext
  );

  return composeMessages;
};
